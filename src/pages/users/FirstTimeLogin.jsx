import React from 'react'
import { Link, useParams } from 'react-router-dom'

const FirstTimeLogin = () => {
    const id = useParams().id;
    console.log("ID", id);
    return (
        <div className="cp-success-box">
            <div className="text-center container">
                <h1><span className="text-success">Success! Your password has been updated successfully.</span></h1>
                <h1>Your transaction password is <span className="text-info token-box">{id}</span>. </h1>
                <h2>Please remember this transaction password, from now on all transcation of the website can be done only with this password and keep one thing in mind, do not share this password with anyone.</h2>
                <h2 className="mt-3 text-dark">Thank you, Team {import.meta.env.VITE_SITE_URL}</h2>
                <div className="font-hindi">
                    <h1 className="mt-5"><span className="text-success">Success! आपका पासवर्ड बदला जा चुका है।</span></h1>
                    <h1>आपका लेनदेन पासवर्ड <span className="text-info token-box">{id}</span> है।</h1>
                    <h2>कृपया इस लेन-देन के पासवर्ड को याद रखें, अब से वेबसाइट के सभी हस्तांतरण केवल इस पासवर्ड से किए जा सकते हैं और एक बात का ध्यान रखें, इस पासवर्ड को किसी के साथ साझा न करें।</h2>
                    <h2 className="mt-3 text-dark">धन्यवाद, टीम {import.meta.env.VITE_SITE_URL}</h2>
                </div>
                <Link to="/admin" className="btn btn-dark btn-lg mt-5 router-link-active" style={{ minWidth: "200px" }}>
                    <i className="fas fa-arrow-left mr-3"></i>Back
                </Link>
            </div>
        </div>
    )
}

export default FirstTimeLogin