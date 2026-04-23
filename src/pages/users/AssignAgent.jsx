import React from 'react'
import PageNamePath from '../../components/PageNamePath'

const AssignAgent = () => {
    return (
        <>
            <PageNamePath
                pageName="Assign Agent"
                pathArr={[
                    { path: "/admin/home", name: "Home" },
                    { path: "", name: "Assign Agent" }
                ]}
            />
        </>
    )
}

export default AssignAgent