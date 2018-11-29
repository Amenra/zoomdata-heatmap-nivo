/* global controller */

import React from 'react';
import { render } from 'react-dom';
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

controller.update = data => {
    const multiGroupAccessor = controller.dataAccessors['Multi Group By'];
    const metricAccessor = controller.dataAccessors['Color Metric'];

    render((
        <ResponsiveHeatMapCanvas
            data={getChartData(data, multiGroupAccessor, metricAccessor)}
            keys={getColumns(multiGroupAccessor)}
            colors={multiGroupAccessor.getColorRange()}
            margin={{
                top: 100,
                right: 20,
                bottom: 0,
                left: 70
            }}
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
        />
    ), controller.element);
};

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

    return [...dataMap].map(([id, item]) => {
        return { ...item, id };
    });
}

function getColumns(multiGroupAccessor) {
    return multiGroupAccessor.getDomain().map(key => {
        return multiGroupAccessor.format(key, 1)
    });
}

function createDataMapItem(keys) {
    const item = {};

    for (const key of keys) {
        item[key] = NaN;
    }

    return item;
}
