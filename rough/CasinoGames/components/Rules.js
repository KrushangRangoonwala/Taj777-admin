import React from 'react'

const Rules = ({ header, rules }) => {
  return (
    <div className="mt-2">

      <div
        style={{
          // maxWidth: "375px",
          // marginLeft: "auto",
          // marginRight: "auto",
          backgroundColor: "#2e3439",
          borderRadius: "4px",
          overflow: "hidden",
          border: "1px solid #2d3748",
        }}
      >
        <div
          style={{
            backgroundColor: "#1a6a48",
            color: "#ffffff",
            fontSize: "13px",
            padding: "5.5px",
            textAlign: "center",
            fontWeight: "600",
          }}
        >
          {header}
        </div>
        <div>
          {rules.map((rule, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "12px",
                padding: "5px 12px",
                borderBottom: index === rules.length - 1 ? "none" : "1px solid #4b5563",
                backgroundColor: "var(--bg-table)",
                color: "var(--text-table)",
              }}
            >
              <span>{rule.label}</span>
              <span
                style={{
                  fontWeight: "300",
                  width: "200px",
                  display: "inline-block",
                  textAlign: "left",
                  paddingLeft: "40px",
                }}
              >
                {rule.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Rules