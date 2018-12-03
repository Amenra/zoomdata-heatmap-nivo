/* global controller */

const DEFAULT_NAN_LABEL = '';
const DEFAULT_NAN_COLOR = '#f1f1f1';
const __BAD_PADDING = 10;

import React from 'react';
import { findDOMNode } from 'react-dom';
import { ResponsiveHeatMapCanvas } from '@nivo/heatmap';

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

function getChartData(data, multiGroupAccessor, metricAccessor) {
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
        item[secondGroup] = metricAccessor.raw(datum);
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

        controller.update = controllerProvidedData => {
            const multiGroupAccessor = controller.dataAccessors['Multi Group By'];
            const metricAccessor = controller.dataAccessors['Color Metric'];

            const data = getChartData(controllerProvidedData, multiGroupAccessor, metricAccessor);
            const columns = getColumns(multiGroupAccessor);
            const colors = multiGroupAccessor.getColorRange();

            const left = getMaxCanvasTextWidth(data.map(({ id }) => id));
            const top = getMaxCanvasTextWidth(columns);

            this.setState({
                controllerProvidedData,
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

        const clickedGroup = clickedCell.yKey + clickedCell.xKey;
        const { left, top, controllerProvidedData } = this.state;

        const data = controllerProvidedData.find( dataum => dataum.group.join('') === clickedGroup );
        const canvas = findDOMNode(this.HeatMapContainerRef.current).getBoundingClientRect();

        controller.menu.show({
            x: canvas.x + clickedCell.x + left,
            y: canvas.y + clickedCell.y + top,
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

                                // Works only if remove memoize function from the Nivo source code
                                // getLabelTextColor={function(node){
                                //     return isNaN(node.value) ? '#f1f1f1' : 'black';
                                // }}
                            />
                        : <span> Loading ... </span>}
            </div>);
    }
}
