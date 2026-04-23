import React from 'react'
import { footerText } from '../utilies/helpers'

const LoginModal = ({ children, toggleLogin }) => {
    return (
        <div data-v-019a5d71="">
            <div data-v-019a5d71="" className="right-bar">
                <div data-v-019a5d71="">
                    <div data-v-019a5d71="" className="rightbar-title px-3 py-4">
                        <a data-v-019a5d71="" href="javascript:void(0);" className="closebtn float-right" onClick={toggleLogin}></a>
                        <h3 data-v-019a5d71="" className="m-0 text-light">ADMIN LOGIN</h3>
                    </div>
                    <hr data-v-019a5d71="" className="mt-0" />
                    <div data-v-019a5d71="" className="p-4 mt-5">
                        <div data-v-019a5d71="" className="overflow-hidden">

                            {children}

                            <div data-v-019a5d71="" className="text-center text-secondary mt-2">
                                <div data-v-019a5d71="" className="mb-2">© Copyright 2021. All Rights Reserved.</div>
                                {footerText}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div data-v-019a5d71="" className="rightbar-overlay"></div>
        </div>
    )
}

export default LoginModal