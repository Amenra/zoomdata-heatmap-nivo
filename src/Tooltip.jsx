import React from 'react';

const labelStyle = {
    'text-transform': 'uppercase',
    'font-weight': 'bold',
    'padding-bottom': '2px',
    'font-size': '12px',
}

const valueStyle = {
    'border-bottom': '1px solid #ccc',
    'padding-bottom': '2px',
}

const Tooltip = ({ xGroupTitle, yGroupTitle, metricTitle, yKey, xKey, value }) => (
    <div className="zd_controls_tooltip_content">
        <div className="zd_tooltip_info_group customized">
            <div className="zd_tooltip_info_table">
                <div className="zd_tooltip_info_table_row">
                    <div className="zd_tooltip_info_table_row_label" style={labelStyle}>{yGroupTitle}</div>
                    <div className="zd_tooltip_info_table_row_value" style={valueStyle}>{yKey}</div></div>
                <div className="zd_tooltip_info_table_row">
                    <div className="zd_tooltip_info_table_row_label" style={labelStyle}>{xGroupTitle}</div>
                    <div className="zd_tooltip_info_table_row_value" style={valueStyle}>{xKey}</div></div>
                <div className="zd_tooltip_info_table_row">
                    <div className="zd_tooltip_info_table_row_label" style={labelStyle}>{metricTitle}</div>
                    <div className="zd_tooltip_info_table_row_value">{value}
                        <div className="color_icon active" style={{'background-color': 'rgb(213, 242, 244)'}}></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
)

export default Tooltip