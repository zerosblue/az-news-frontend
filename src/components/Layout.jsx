import React, { useContext, useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom'; // ★ Link 추가됨
import styled from 'styled-components';
import { FaRegNewspaper, FaListAlt, FaHashtag, FaUser, FaSun, FaMoon, FaRegBell, FaSignOutAlt, FaTimes } from "react-icons/fa";
import { UserContext } from '../context/UserContext';
import axios from '../api/axios';

const Layout = ({ isDarkMode, toggleTheme }) => {
  const navigate = useNavigate();
  const { user, logout } = useContext(UserContext);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) { setUnreadCount(0); return; }
    const checkUnread = async () => {
      try {
        const res = await axios.get('/api/notifications/unread-count');
        setUnreadCount(res.data);
      } catch (err) { console.error(err); }
    };
    checkUnread();
    const interval = setInterval(checkUnread, 30000); // 30초 부하 방지
    return () => clearInterval(interval);
  }, [user]);

  const toggleNotification = async () => {
    if (!isNotiOpen) {
      try {
        const res = await axios.get('/api/notifications');
        setNotifications(res.data);
      } catch (err) { console.error("알림 목록 로딩 실패"); }
    }
    setIsNotiOpen(!isNotiOpen);
  };

  const handleNotiClick = async (noti) => {
    try {
      await axios.post(`/api/notifications/${noti.id}/read`);
      setUnreadCount(prev => Math.max(0, prev - 1));
      setIsNotiOpen(false);
      window.open(noti.link, '_blank');
    } catch (err) { console.error("알림 읽음 처리 실패"); }
  };

  return (
    <OuterBackground>
      <AppContainer>
        <Header>
          <HeaderLeft>
             <Logo onClick={() => navigate('/')} $isDarkMode={isDarkMode}>News Azit</Logo>
          </HeaderLeft>
          <HeaderRight>
            <IconButton onClick={toggleTheme} title="테마 변경">
              {isDarkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
            </IconButton>
            <NotiWrapper>
              <IconButton title="알림" onClick={toggleNotification}>
                <FaRegBell size={20} />
                {unreadCount > 0 && <NotiBadge />}
              </IconButton>
              {isNotiOpen && (
                <NotiDropdown>
                  <NotiHeader><span>알림 센터</span><CloseBtn onClick={() => setIsNotiOpen(false)}><FaTimes /></CloseBtn></NotiHeader>
                  <NotiList>
                    {notifications.length > 0 ? notifications.map((noti) => (
                      <NotiItem key={noti.id} onClick={() => handleNotiClick(noti)} $isRead={noti.read}>
                        <NotiMessage>{noti.message}</NotiMessage>
                        <NotiTime>{new Date(noti.createdAt).toLocaleString()}</NotiTime>
                        {!noti.read && <NewDot />}
                      </NotiItem>
                    )) : <EmptyNoti>새로운 알림이 없습니다.</EmptyNoti>}
                  </NotiList>
                </NotiDropdown>
              )}
            </NotiWrapper>
            {user ? (
              <>
                <UserName>{user.nickname || user.name || "회원"}님</UserName>
                <IconButton onClick={logout} title="로그아웃"><FaSignOutAlt size={20} /></IconButton>
              </>
            ) : (
              <LoginBtn onClick={() => navigate('/login')}>로그인</LoginBtn>
            )}
          </HeaderRight>
        </Header>

        <BodyWrapper>
          <NavBar>
            <NavItem to="/" end><FaRegNewspaper size={20} /><span>뉴스</span></NavItem>
            <NavItem to="/board"><FaListAlt size={20} /><span>게시판</span></NavItem>
            <NavItem to="/feed"><FaHashtag size={20} /><span>피드</span></NavItem>
            <NavItem to="/mypage"><FaUser size={20} /><span>마이</span></NavItem>
          </NavBar>

          <MainContent>
            <Outlet />
            
            {/* ★ Footer 영역: 클릭 시 /terms, /privacy로 이동함 */}
            <Footer>
              <FooterLinks>
                <Link to="/terms">이용약관</Link>
                <Link to="/privacy">개인정보처리방침</Link>
                <span>문의하기: unemployeekim@gmail.com</span>
              </FooterLinks>
              <CopyRight>© 2026 AZ News Azit. All rights reserved.</CopyRight>
            </Footer>
          </MainContent>
        </BodyWrapper>
      </AppContainer>
    </OuterBackground>
  );
};

export default Layout;

// --- [스타일 정의] ---
const OuterBackground = styled.div` width: 100%; min-height: 100vh; background-color: #000; display: flex; justify-content: center; `;
const AppContainer = styled.div` width: 100%; min-height: 100vh; background-color: ${props => props.theme.bg}; color: ${props => props.theme.text}; display: flex; flex-direction: column; `;
const Header = styled.header` height: 60px; background-color: ${props => props.theme.navBg}; border-bottom: 1px solid ${props => props.theme.border}; display: flex; justify-content: space-between; align-items: center; padding: 0 20px; position: fixed; top: 0; left: 0; width: 100%; z-index: 1000; box-sizing: border-box; `;
const HeaderLeft = styled.div` display: flex; align-items: center; @media (min-width: 768px) { width: 240px; } `;
const Logo = styled.h1` font-size: 22px; font-weight: bold; cursor: pointer; color: ${props => props.$isDarkMode ? '#ffc107' : '#007bff'}; `;
const HeaderRight = styled.div` display: flex; align-items: center; gap: 15px; `;
const IconButton = styled.button` background: none; border: none; color: ${props => props.theme.text}; cursor: pointer; display: flex; align-items: center; justify-content: center; position: relative; padding: 5px; &:hover { color: ${props => props.theme.active}; } `;
const NotiWrapper = styled.div` position: relative; `;
const NotiBadge = styled.div` position: absolute; top: 5px; right: 5px; width: 6px; height: 6px; background-color: red; border-radius: 50%; `;
const UserName = styled.span` font-size: 14px; font-weight: bold; color: ${props => props.theme.subText}; `;
const LoginBtn = styled.button` background-color: ${props => props.theme.active}; border: none; padding: 6px 12px; border-radius: 4px; font-weight: bold; font-size: 12px; cursor: pointer; color: #121212; `;
const NotiDropdown = styled.div` position: absolute; top: 40px; right: -50px; width: 300px; max-height: 400px; background-color: ${props => props.theme.cardBg}; border: 1px solid ${props => props.theme.border}; border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); overflow-y: auto; z-index: 2000; display: flex; flex-direction: column; @media (max-width: 768px) { right: -80px; width: 280px; } `;
const NotiHeader = styled.div` padding: 10px 15px; border-bottom: 1px solid ${props => props.theme.border}; font-weight: bold; font-size: 14px; display: flex; justify-content: space-between; align-items: center; background-color: ${props => props.theme.navBg}; `;
const CloseBtn = styled.button` background: none; border: none; color: ${props => props.theme.text}; cursor: pointer; font-size: 20px; `;
const NotiList = styled.div` flex: 1; `;
const NotiItem = styled.div` padding: 15px; border-bottom: 1px solid ${props => props.theme.border}; cursor: pointer; position: relative; background-color: ${props => props.$isRead ? 'transparent' : props.theme.bg}; &:hover { background-color: ${props => props.theme.hover}; } `;
const NotiMessage = styled.p` font-size: 13px; line-height: 1.4; margin-bottom: 5px; `;
const NotiTime = styled.span` font-size: 11px; color: ${props => props.theme.subText}; `;
const NewDot = styled.div` position: absolute; top: 15px; right: 15px; width: 6px; height: 6px; background-color: ${props => props.theme.active}; border-radius: 50%; `;
const EmptyNoti = styled.div` padding: 20px; text-align: center; font-size: 13px; color: ${props => props.theme.subText}; `;
const BodyWrapper = styled.div` display: flex; margin-top: 60px; min-height: calc(100vh - 60px); width: 100%; `;
const NavBar = styled.nav` background-color: ${props => props.theme.navBg}; z-index: 900; position: fixed; bottom: 0; left: 0; width: 100%; height: 70px; border-top: 1px solid ${props => props.theme.border}; display: flex; justify-content: space-around; align-items: center; @media (min-width: 768px) { position: fixed; top: 60px; left: 0; bottom: 0; width: 240px; border-top: none; border-right: 1px solid ${props => props.theme.border}; flex-direction: column; justify-content: flex-start; padding-top: 20px; } `;
const NavItem = styled(NavLink)` display: flex; align-items: center; text-decoration: none; color: ${props => props.theme.subText}; transition: 0.2s; flex-direction: column; font-size: 11px; gap: 6px; padding: 10px; @media (min-width: 768px) { flex-direction: row; font-size: 16px; width: 90%; padding: 15px 20px; border-radius: 8px; gap: 15px; margin-bottom: 5px; &:hover { background-color: ${props => props.theme.hover}; } } &.active { color: ${props => props.theme.active}; font-weight: bold; @media (min-width: 768px) { background-color: ${props => props.theme.hover}; } } `;
const MainContent = styled.main` flex: 1; background-color: ${props => props.theme.bg}; padding: 20px; padding-bottom: 90px; width: 100%; display: flex; flex-direction: column; @media (min-width: 768px) { margin-left: 240px; padding-bottom: 20px; padding-left: 40px; padding-right: 40px; } `;

// ★ Footer 스타일
const Footer = styled.footer`
  margin-top: auto; /* 내용이 적어도 바닥에 붙게 함 */
  padding: 40px 20px;
  background-color: ${props => props.theme.navBg};
  border-top: 1px solid ${props => props.theme.border};
  text-align: center;
  font-size: 12px;
  color: ${props => props.theme.subText};
`;
const FooterLinks = styled.div`
  display: flex; justify-content: center; gap: 20px; margin-bottom: 10px;
  a { color: ${props => props.theme.subText}; text-decoration: none; &:hover { text-decoration: underline; color: ${props => props.theme.text}; } }
  span { cursor: default; }
`;
const CopyRight = styled.div` opacity: 0.7; `;