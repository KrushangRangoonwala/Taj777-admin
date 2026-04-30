import React from 'react'
import { useNavigate } from 'react-router-dom';

const PageNamePath = ({ pageName, pathArr }) => {
    const navigate = useNavigate();
    return (
        <div className="row">
            <div className="col-12">
                <div className="page-title-box d-flex align-items-center justify-content-between">
                    <h4 className="mb-0 font-size-18" style={{ position: 'relative', top: '-1.2px' }}>{pageName}</h4>
                    <div className="page-title-right">
                        <ol className="breadcrumb m-0">
                            {pathArr?.map((item, index) =>
                                <li key={index} className={`breadcrumb-item ${index === pathArr.length - 1 ? 'active' : ''}`}>
                                    <span
                                        aria-current="location"
                                        onClick={() => item?.path && navigate(item?.path)}
                                        className={item?.path ? "pointer" : ""}
                                    >
                                        {item?.name}
                                    </span>
                                </li>
                            )}
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PageNamePath