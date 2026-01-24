import React, { useState, useEffect, useContext, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { UserContext } from '../context/UserContext';
import { FaCamera, FaPen, FaSignOutAlt, FaTimes, FaUserCircle, FaPlus } from "react-icons/fa";

const MyPage = () => {
  const navigate = useNavigate();
  const { user, setUser, logout } = useContext(UserContext);
  
  // 프로필 상태
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState("");
  const [profileFile, setProfileFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  
  // 데이터 상태 (초기값 배열로 확실하게!)
  const [keywords, setKeywords] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [followings, setFollowings] = useState([]);
  
  const [activeModal, setActiveModal] = useState(null);
  const [newKeyword, setNewKeyword] = useState("");

  const fileInputRef = useRef(null);

  // 1. 초기 데이터 로딩 (각각 따로 불러옴 - 안전 제일!)
  useEffect(() => {
    if (!user) return;

    setNickname(user.nickname || user.name);
    setPreviewUrl(user.profileImg ? `http://localhost:8080${user.profileImg}` : null);

    // (1) 키워드 가져오기
    const fetchKeywords = async () => {
      try {
        const res = await axios.get('/api/keywords');
        console.log("키워드 로딩 성공:", res.data);
        setKeywords(res.data || []);
      } catch (err) {
        console.error("키워드 로딩 실패:", err);
      }
    };

    // (2) 팔로워/팔로잉 가져오기
    const fetchFollows = async () => {
      try {
        const fRes = await axios.get('/api/feed/followers');
        setFollowers(fRes.data || []);
      } catch (err) { console.error("팔로워 로딩 실패"); }

      try {
        const fingRes = await axios.get('/api/feed/followings');
        setFollowings(fingRes.data || []);
      } catch (err) { console.error("팔로잉 로딩 실패"); }
    };

    fetchKeywords();
    fetchFollows();
  }, [user]); // user가 바뀔 때마다 실행

  // --- 이하 핸들러 함수들은 기존과 동일 ---

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    const formData = new FormData();
    if (nickname) formData.append("data", new Blob([JSON.stringify({ nickname })], { type: "application/json" }));
    if (profileFile) formData.append("file", profileFile);

    try {
      const res = await axios.put('/api/member/me', formData);
      alert("프로필이 수정되었습니다.");
      setUser({ ...user, ...res.data });
      setIsEditing(false);
    } catch (err) { alert("수정 실패"); }
  };

  const handleToggleFollow = async (targetEmail) => {
    try {
      const res = await axios.post(`/api/feed/follow/${targetEmail}`);
      const isFollowingNow = res.data;

      if (activeModal === 'following') {
        if (!isFollowingNow) setFollowings(prev => prev.filter(u => u.email !== targetEmail));
      } else if (activeModal === 'follower') {
        setFollowers(prev => prev.map(u => u.email === targetEmail ? { ...u, isFollowedByMe: isFollowingNow } : u));
        // 팔로잉 목록 갱신
        const fingRes = await axios.get('/api/feed/followings');
        setFollowings(fingRes.data);
      }
    } catch (err) { alert("처리 실패"); }
  };

  const handleAddKeyword = async () => {
    if (!newKeyword.trim()) return;
    try {
      const res = await axios.post('/api/keywords', { keyword: newKeyword });
      setKeywords(res.data);
      setNewKeyword("");
    } catch (err) { alert("키워드 추가 실패"); }
  };

  const handleDeleteKeyword = async (keyword) => {
    if (!window.confirm("삭제하시겠습니까?")) return;
    try {
      const res = await axios.delete(`/api/keywords?keyword=${keyword}`);
      setKeywords(res.data);
    } catch (err) { alert("삭제 실패"); }
  };

  if (!user) return null;

  return (
    <Container>
      <PageTitle>마이페이지</PageTitle>

      <ProfileCard>
        <ProfileImageWrapper>
          {previewUrl ? <ProfileImg src={previewUrl} /> : <FaUserCircle size={100} color="#888" />}
          {isEditing && <CameraBtn onClick={() => fileInputRef.current.click()}><FaCamera /></CameraBtn>}
          <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />
        </ProfileImageWrapper>

        <UserInfo>
          {isEditing ? (
            <NameInput value={nickname} onChange={(e) => setNickname(e.target.value)} autoFocus />
          ) : (
            <UserName>{user.nickname || user.name}님</UserName>
          )}
          <UserEmail>{user.email}</UserEmail>
        </UserInfo>

        <EditBtnGroup>
          {isEditing ? (
            <>
              <SaveBtn onClick={handleSaveProfile}>저장</SaveBtn>
              <CancelBtn onClick={() => { setIsEditing(false); setNickname(user.nickname); }}>취소</CancelBtn>
            </>
          ) : (
            <EditBtn onClick={() => setIsEditing(true)}><FaPen /> 프로필 편집</EditBtn>
          )}
        </EditBtnGroup>
      </ProfileCard>

      <StatsSection>
        <StatItem onClick={() => setActiveModal('following')}>
          <StatNum>{followings.length}</StatNum>
          <StatLabel>팔로잉</StatLabel>
        </StatItem>
        <StatItem onClick={() => setActiveModal('follower')}>
          <StatNum>{followers.length}</StatNum>
          <StatLabel>팔로워</StatLabel>
        </StatItem>
        <StatItem onClick={() => setActiveModal('keyword')}>
          <StatNum>{keywords.length}</StatNum>
          <StatLabel>구독 키워드</StatLabel>
        </StatItem>
      </StatsSection>

      <SectionTitle>🔔 내 알림 키워드</SectionTitle>
      <KeywordList>
        {keywords.length > 0 ? keywords.map((k, i) => (
          <KeywordTag key={i}>
            {k} <span onClick={() => handleDeleteKeyword(k)}><FaTimes /></span>
          </KeywordTag>
        )) : <EmptyMsg>등록된 키워드가 없습니다.</EmptyMsg>}
      </KeywordList>

      <LogoutButton onClick={logout}><FaSignOutAlt /> 로그아웃</LogoutButton>

      {/* 모달 */}
      {activeModal && (
        <ModalOverlay onClick={() => setActiveModal(null)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <h3>
                {activeModal === 'following' && "팔로잉 목록"}
                {activeModal === 'follower' && "팔로워 목록"}
                {activeModal === 'keyword' && "구독 키워드 관리"}
              </h3>
              <CloseBtn onClick={() => setActiveModal(null)}><FaTimes /></CloseBtn>
            </ModalHeader>

            <ModalBody>
              {(activeModal === 'following' || activeModal === 'follower') && (
                <UserList>
                  {(activeModal === 'following' ? followings : followers).map((u, idx) => (
                    <UserItem key={idx}>
                      <UserInfoRow>
                        {u.profileImg ? <SmallProfile src={`http://localhost:8080${u.profileImg}`} /> : <FaUserCircle size={35} color="#888"/>}
                        <div style={{marginLeft: 10}}>
                          <div style={{fontWeight:'bold', fontSize:'14px'}}>{u.nickname}</div>
                          <div style={{fontSize:'12px', color:'#888'}}>{u.email}</div>
                        </div>
                      </UserInfoRow>
                      {u.email !== user.email && (
                        <FollowBtn onClick={() => handleToggleFollow(u.email)} $active={u.isFollowedByMe}>
                          {u.isFollowedByMe ? "언팔로우" : "팔로우"}
                        </FollowBtn>
                      )}
                    </UserItem>
                  ))}
                  {(activeModal === 'following' ? followings : followers).length === 0 && <EmptyMsg>목록이 비어있습니다.</EmptyMsg>}
                </UserList>
              )}

              {activeModal === 'keyword' && (
                <>
                  <InputBox>
                    <input type="text" placeholder="새 키워드 입력" value={newKeyword} onChange={(e) => setNewKeyword(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()} />
                    <button onClick={handleAddKeyword}><FaPlus /></button>
                  </InputBox>
                  <KeywordList>
                    {keywords.map((k, i) => (
                      <KeywordTag key={i}>
                        {k} <span onClick={() => handleDeleteKeyword(k)}><FaTimes /></span>
                      </KeywordTag>
                    ))}
                    {keywords.length === 0 && <EmptyMsg>등록된 키워드가 없습니다.</EmptyMsg>}
                  </KeywordList>
                </>
              )}
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default MyPage;

// --- 스타일 정의 (기존과 동일) ---
const Container = styled.div` padding: 20px; max-width: 600px; margin: 0 auto; color: ${props => props.theme.text}; `;
const PageTitle = styled.h2` font-size: 24px; font-weight: bold; margin-bottom: 20px; `;
const ProfileCard = styled.div` display: flex; flex-direction: column; align-items: center; background-color: ${props => props.theme.cardBg}; padding: 30px; border-radius: 16px; border: 1px solid ${props => props.theme.border}; margin-bottom: 20px; `;
const ProfileImageWrapper = styled.div` position: relative; margin-bottom: 15px; `;
const ProfileImg = styled.img` width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 3px solid ${props => props.theme.active}; background-color: #000; `;
const CameraBtn = styled.button` position: absolute; bottom: 0; right: 0; background: ${props => props.theme.active}; color: black; width: 30px; height: 30px; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; `;
const UserInfo = styled.div` text-align: center; margin-bottom: 20px; width: 100%; `;
const UserName = styled.h3` font-size: 20px; font-weight: bold; margin-bottom: 5px; `;
const UserEmail = styled.p` font-size: 14px; color: ${props => props.theme.subText}; `;
const NameInput = styled.input` font-size: 18px; padding: 8px; border-radius: 6px; border: 1px solid ${props => props.theme.border}; background: ${props => props.theme.bg}; color: ${props => props.theme.text}; text-align: center; `;
const EditBtnGroup = styled.div` display: flex; gap: 10px; `;
const EditBtn = styled.button` background: transparent; border: 1px solid ${props => props.theme.border}; color: ${props => props.theme.text}; padding: 8px 16px; border-radius: 20px; cursor: pointer; display: flex; align-items: center; gap: 5px; font-size: 13px; &:hover { background: ${props => props.theme.hover}; } `;
const SaveBtn = styled(EditBtn)` background: ${props => props.theme.active}; color: black; border: none; &:hover { opacity: 0.9; } `;
const CancelBtn = styled(EditBtn)` border-color: ${props => props.theme.subText}; `;
const StatsSection = styled.div` display: flex; justify-content: space-around; margin-bottom: 30px; background: ${props => props.theme.cardBg}; padding: 20px; border-radius: 12px; border: 1px solid ${props => props.theme.border}; `;
const StatItem = styled.div` text-align: center; cursor: pointer; padding: 5px 10px; border-radius: 8px; &:hover { background: ${props => props.theme.hover}; } `;
const StatNum = styled.div` font-size: 20px; font-weight: bold; color: ${props => props.theme.active}; `;
const StatLabel = styled.div` font-size: 12px; color: ${props => props.theme.subText}; `;
const SectionTitle = styled.h4` font-size: 16px; margin-bottom: 15px; color: ${props => props.theme.text}; `;
const KeywordList = styled.div` display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 40px; `;
const KeywordTag = styled.div` background-color: ${props => props.theme.hover}; color: ${props => props.theme.text}; padding: 8px 12px; border-radius: 20px; font-size: 13px; display: flex; align-items: center; gap: 8px; span { cursor: pointer; &:hover { color: #ff6b6b; } } `;
const EmptyMsg = styled.span` color: ${props => props.theme.subText}; font-size: 14px; `;
const LogoutButton = styled.button` width: 100%; padding: 15px; border-radius: 12px; border: 1px solid #ff6b6b; color: #ff6b6b; background: transparent; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; &:hover { background: rgba(255, 107, 107, 0.1); } `;
const ModalOverlay = styled.div` position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 2000; display: flex; align-items: center; justify-content: center; `;
const ModalContent = styled.div` width: 90%; max-width: 400px; background: ${props => props.theme.cardBg}; border-radius: 16px; padding: 20px; border: 1px solid ${props => props.theme.border}; max-height: 70vh; display: flex; flex-direction: column; `;
const ModalHeader = styled.div` display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; h3 { margin: 0; font-size: 18px; color: ${props => props.theme.text}; } `;
const CloseBtn = styled.button` background: none; border: none; color: ${props => props.theme.text}; cursor: pointer; font-size: 20px; `;
const ModalBody = styled.div` overflow-y: auto; flex: 1; `;
const UserList = styled.div` display: flex; flex-direction: column; gap: 15px; `;
const UserItem = styled.div` display: flex; justify-content: space-between; align-items: center; padding-bottom: 10px; border-bottom: 1px solid ${props => props.theme.border}; &:last-child { border-bottom: none; } `;
const UserInfoRow = styled.div` display: flex; align-items: center; `;
const SmallProfile = styled.img` width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 1px solid ${props => props.theme.border}; `;
const FollowBtn = styled.button` background: ${props => props.$active ? 'transparent' : props.theme.text}; color: ${props => props.$active ? props.theme.text : props.theme.bg}; border: 1px solid ${props => props.theme.text}; border-radius: 20px; padding: 5px 15px; font-size: 12px; font-weight: bold; cursor: pointer; &:hover { opacity: 0.8; } `;
const InputBox = styled.div` display: flex; gap: 10px; margin-bottom: 15px; input { flex: 1; padding: 10px; border-radius: 8px; border: 1px solid ${props => props.theme.border}; background: ${props => props.theme.bg}; color: ${props => props.theme.text}; outline: none; &:focus { border-color: ${props => props.theme.active}; } } button { padding: 0 15px; border-radius: 8px; border: none; background: ${props => props.theme.active}; color: #121212; cursor: pointer; } `;