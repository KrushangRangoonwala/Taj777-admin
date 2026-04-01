import React from 'react'

const Rules = ({ title, rules = [] }) => {
    return (
        <table class="table table-bordered rules-table">
            <tbody>
                <tr class="text-center">
                    <th colspan="2">{title}</th>
                </tr>

                {rules?.map((rule, index) => (
                    <tr key={index}>
                        <td width="60%">{rule.label}</td>
                        <td>{rule.value}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

export default Rules;

export function RulesHeader({ title = "Rules" }) {
    return (
        <div className="card-header">
            <h6 className="card-title d-inline-block">
                {title}
            </h6>
        </div>
    )
}