import React, { useState } from 'react';
import { Modal, Collapse } from 'react-bootstrap';
import { RULES_DATA } from './RulesData';

const cssStyle = {
    position: 'absolute',
    transform: 'translate3d(0px, 20px, 0px)',
    top: '0px',
    left: '0px',
    willChange: 'transform'
}

const RulesModal = ({ show, onHide }) => {
    const [showLangOpt, setShowLangOpt] = useState(false)
    const [activeSport, setActiveSport] = useState(null);
    const [activeCategory, setActiveCategory] = useState(null);

    const toggleSport = (sportId) => {
        setActiveSport(activeSport === sportId ? null : sportId);
        setActiveCategory(null); // Reset category when switching sports
    };

    const toggleCategory = (categoryId) => {
        setActiveCategory(activeCategory === categoryId ? null : categoryId);
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
            dialogClassName="modal-lg"
            id="__BVID__42"
            role="dialog"
            aria-labelledby="__BVID__42___BV_modal_title_"
            aria-describedby="__BVID__42___BV_modal_body_"
        >
            <div className="modal-content">
                <header id="__BVID__42___BV_modal_header_" className="modal-header">
                    <h5 id="__BVID__42___BV_modal_title_" className="modal-title">Rules</h5>
                    <button type="button" aria-label="Close" className="close" onClick={onHide}>×</button>
                </header>
                <Modal.Body id="__BVID__42___BV_modal_body_">
                    <div className="main-rules-container">
                        <div className={`dropdown rules-language-container ${showLangOpt ? 'show' : ''}`}>
                            <div data-toggle="dropdown" aria-expanded={showLangOpt} className="dropdown-toggle" onClick={() => setShowLangOpt(!showLangOpt)}>
                                <img src="https://wver.sprintstaticdata.com/v219/static/front/img/flag_english.png" alt="English" />
                                English
                                <i className="fas fa-angle-down ml-1"></i>
                            </div>
                            <div className={`dropdown-menu rules-language ${showLangOpt ? 'show' : ''}`} {...(showLangOpt ? { style: { ...cssStyle, 'x-placement': 'bottom-start' } } : {})}>
                                <div>
                                    <img src="https://wver.sprintstaticdata.com/v219/static/front/img/flag_english.png" alt="English" />
                                    <span>English</span>
                                </div>
                            </div>
                        </div>
                        <div className="menu-box">
                            <div id="accordion">
                                {RULES_DATA.map((sport) => (
                                    <div className="card" key={sport.id}>
                                        <div id={`${sport.id}head`} className="card-header">
                                            <a
                                                href="javascript:void(0)"
                                                className={activeSport === sport.id ? "" : "collapsed"}
                                                aria-expanded={activeSport === sport.id}
                                                onClick={() => toggleSport(sport.id)}
                                            >
                                                {sport.name}
                                            </a>
                                        </div>
                                        <Collapse in={activeSport === sport.id}>
                                            <div id={sport.id}>
                                                <div id={`${sport.id}accordion`} className="card-body">
                                                    {sport.categories.map((category) => (
                                                        <div className="card" key={category.id}>
                                                            <div className="card-header">
                                                                <a
                                                                    href="javascript:void(0)"
                                                                    className={activeCategory === category.id ? "" : "collapsed"}
                                                                    aria-expanded={activeCategory === category.id}
                                                                    onClick={() => toggleCategory(category.id)}
                                                                >
                                                                    {category.name}
                                                                </a>
                                                            </div>
                                                            <Collapse in={activeCategory === category.id}>
                                                                <div id={category.id} className="card-body">
                                                                    {category.rules.map((rule, index) => (
                                                                        <div
                                                                            key={index}
                                                                            className={`rule-text ${rule.isDanger ? 'text-danger' : ''}`}
                                                                            dangerouslySetInnerHTML={{ __html: rule.text }}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            </Collapse>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </Collapse>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Modal.Body>
            </div>
        </Modal>
    );
};

export default RulesModal;
