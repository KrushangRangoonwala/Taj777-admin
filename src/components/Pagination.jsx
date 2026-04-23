import React from 'react'

const Pagination = ({ currentPage, totalPages, apiCallByPageNo }) => {

    const changePage = (page) => {
        if (page >= 1 && page <= totalPages) {
            apiCallByPageNo(page);
        }
    };

    const getPageNumbers = () => {
        const totalNumbers = 5;
        let start = Math.max(currentPage - 2, 1);
        let end = start + totalNumbers - 1;

        if (end > totalPages) {
            end = totalPages;
            start = Math.max(end - totalNumbers + 1, 1);
        }
        const aa = Array.from({ length: end - start + 1 }, (_, i) => start + i);
        return aa?.length > 0 ? aa : [1];
    };

    return (
        <div className="row pt-3">
            <div className="col">
                <ul className="pagination pagination-rounded mb-0 float-right">

                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => changePage(1)}>«</button>
                    </li>

                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => changePage(currentPage - 1)}>‹</button>
                    </li>

                    {getPageNumbers().map((page) => (
                        <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                            <button className="page-link" onClick={() => changePage(page)}>
                                {page}
                            </button>
                        </li>
                    ))}

                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => changePage(currentPage + 1)}>›</button>
                    </li>

                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => changePage(totalPages)}>»</button>
                    </li>

                </ul>
            </div>
        </div>
    )
}

export default Pagination