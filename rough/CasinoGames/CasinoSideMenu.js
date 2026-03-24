import { useNavigate } from 'react-router-dom';
import { Sidenav, Nav } from 'rsuite';
import Logo from '../Sidebar/Logo';

const menuItems = [
    { label: 'All Casino', id: 'ourCasino' },
    { label: 'Roulette', id: 'roulette' },
    { label: 'Teenpatti', id: 'teenpatti' },
    { label: 'Poker', id: 'poker' },
    { label: 'Baccarat', id: 'Baccarat' },
    { label: 'Dragon Tiger', id: 'DragonTiger' },
    { label: '32 Cards', id: '32Cards' },
    { label: 'Andar Bahar', id: 'AndarBahar' },
    { label: 'Lucky 7', id: 'Lucky7' },
    { label: '3 Card Judgement', id: '3CardJudgement' },
    { label: 'Casino War', id: 'CasinoWar' },
    { label: 'Queen', id: 'Queen' },
    { label: 'Race to 2nd', id: 'race2' },
    { label: 'Race 20', id: 'race20' },
];

const CasinoSideMenu = ({ handleNavigate }) => {
    return (

        <div className="menu-box">
            <div className="sports-list-content-casino">
                <div className="all-menu-casino">
                    <span mode="out-in">
                        <Sidenav defaultOpenKeys={['3', '4']}>
                            <Logo />
                            <Sidenav.Body>
                                <Nav>
                                    {menuItems.map((item, index) => (
                                        <Nav.Item
                                            key={index}
                                            eventKey={String(index + 1)}
                                            onClick={() => handleNavigate('/owncasino', item.id)}
                                        >
                                            {item.label}
                                        </Nav.Item>
                                    ))}
                                </Nav>
                            </Sidenav.Body>
                        </Sidenav>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default CasinoSideMenu;