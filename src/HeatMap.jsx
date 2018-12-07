/* global controller */

const DEFAULT_NAN_LABEL = '';
const DEFAULT_NAN_COLOR = '#f1f1f1';
const __BAD_PADDING = 10;

import React from 'react';
import { findDOMNode } from 'react-dom';
import { ResponsiveHeatMapCanvas } from '@nivo/heatmap';
import Tooltip from './Tooltip';

const multiGroupAccessor = controller.dataAccessors['Multi Group By'];
const colorMetricAccessor = controller.dataAccessors['Color Metric'];

controller.state.initIfEmpty(
    'ShowMetricValues',
    {
        show: !!controller.variables['Show Metric Values']
    }
);

controller.createAxisLabel({
    picks: 'Multi Group By',
    orientation: 'horizontal',
    position: 'bottom'
});

controller.createAxisLabel({
    picks: 'Color Metric',
    orientation: 'horizontal',
    position: 'bottom'
});

function getChartData(data) {
    // Get unique first group values
    const rows = [
        ...new Set(data.map(datum => multiGroupAccessor.formatted(datum, 0)))
    ];

    const cols = getColumns(multiGroupAccessor);

    const dataMap = new Map(
        rows.map(id => [id, createDataMapItem(cols)])
    );

    for (const datum of data) {
        const firstGroup = multiGroupAccessor.formatted(datum, 0);
        const secondGroup = multiGroupAccessor.formatted(datum, 1);
        const item = dataMap.get(firstGroup);
        item[secondGroup] = colorMetricAccessor.raw(datum);
    }

    return [...dataMap].map(([id, item]) => ({ ...item, id }));
}

function getColumns(multiGroupAccessor) {
    return multiGroupAccessor.getDomain().map(key => {
        return multiGroupAccessor.format(key, 1)
    });
}

function createDataMapItem(keys) {
    return keys.reduce((agr, key) => ({ ...agr, [key]: DEFAULT_NAN_LABEL }), {});
}

function getMaxCanvasTextWidth(texts) { // TODO: Move into utilities
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = `14px sans-serif`; // FIXME: this is a guessed value
    const textsWidth = texts.map( text => context.measureText(text).width )
    return Math.max(...textsWidth) + __BAD_PADDING;
}

const defaultState = {
    rawData: [],
    data: [],
    columns: [],
    colors: [],
    top: 0,
    left: 0,
};

export default class HeatMap extends React.Component {
    state = defaultState;

    constructor(props) {
        super(props);

        this.HeatMapContainerRef = React.createRef();

        controller.update = rawData => {
            const data = getChartData(rawData);
            const columns = getColumns(multiGroupAccessor);
            const colors = colorMetricAccessor.colorRange();
            const left = getMaxCanvasTextWidth(data.map(({ id }) => id));
            const top = getMaxCanvasTextWidth(columns);

            this.setState({
                rawData,
                data,
                columns,
                colors,
                left,
                top,
            });
        };
    }

    showRadialMenu(clickedCell) {
        if (!clickedCell.value) return;

        const { left, top, rawData } = this.state;
        const canvasPosition = findDOMNode(this.HeatMapContainerRef.current).getBoundingClientRect();
        const data = rawData.find(datum => {
            const yGroup = multiGroupAccessor.formatted(datum, 0);
            const xGroup = multiGroupAccessor.formatted(datum, 1);

            return yGroup === clickedCell.yKey && xGroup === clickedCell.xKey;
        });

        controller.menu.show({
            x: canvasPosition.x + clickedCell.x + left,
            y: canvasPosition.y + clickedCell.y + top,
            data: () => data
        });
    }

    render() {
        const { data, top, left, columns, colors } = this.state;
        return (
            <div
                id='HeatMapContainer'
                ref={this.HeatMapContainerRef}
                style={{
                    width: '100%',
                }}>
                    {columns.length
                        ? <ResponsiveHeatMapCanvas
                                data={data}
                                keys={columns}
                                colors={colors}
                                nanColor={DEFAULT_NAN_COLOR}
                                margin={{
                                    top,
                                    right: 20,
                                    bottom: 0,
                                    left,
                                }}
                                padding={2}
                                axisTop={{
                                    orient: 'top',
                                    tickSize: 5,
                                    tickPadding: 5,
                                    tickRotation: -90
                                }}
                                axisLeft={{
                                    orient: 'left',
                                    tickSize: 5,
                                    tickPadding: 5,
                                    tickRotation: 0
                                }}
                                cellOpacity={0.95}
                                cellHoverOthersOpacity={0.95}
                                hoverTarget="cell"
                                onClick={this.showRadialMenu.bind(this)}
                                tooltip={function(item){
                                    const groups = multiGroupAccessor.getGroups()
                                    const [ { label: yGroupTitle }, { label: xGroupTitle } ] = groups

                                    const metric = colorMetricAccessor.getMetric()
                                    const { label: metricTitle } = metric
                                    return <Tooltip { ...({
                                        ...item,
                                        value: item.value || 'No data',
                                        xGroupTitle,
                                        yGroupTitle,
                                        metricTitle
                                    }) } />;
                                }}

                                // Works only if remove memoize function from the Nivo source code
                                // getLabelTextColor={function(node){
                                //     return isNaN(node.value) ? '#f1f1f1' : 'black';
                                // }}
                            />
                        : <span> Loading ... </span>}
            </div>);
    }
}
