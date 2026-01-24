import React, { useState, useEffect, useContext, useRef } from 'react';
import styled from 'styled-components';
import axios from '../api/axios';
import { UserContext } from '../context/UserContext';
import { FaHeart, FaRegHeart, FaRegImage, FaTrash, FaUserCircle, FaTimes, FaPen, FaRetweet, FaRegComment } from "react-icons/fa";

// 댓글 아이템 컴포넌트
const FeedCommentItem = ({ comment, feedId, onReplySubmit, refreshFeeds }) => {
  const { user } = useContext(UserContext);
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [editText, setEditText] = useState(comment.content);

  const handleSubmitReply = () => {
    if (!replyText.trim()) return;
    onReplySubmit(feedId, replyText, comment.id);
    setIsReplying(false);
    setReplyText("");
  };

  const handleUpdate = async () => {
    try { await axios.put(`/api/feed/comment/${comment.id}`, { content: editText }); setIsEditing(false); refreshFeeds(); } catch (err) { alert("수정 실패"); }
  };

  const handleDelete = async () => {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;
    try { await axios.delete(`/api/feed/comment/${comment.id}`); refreshFeeds(); } catch (err) { alert("삭제 실패"); }
  };

  const isMyComment = user && (user.nickname === comment.writerName || user.name === comment.writerName);

  return (
    <CommentContainer>
      <CommentRow>
        <CommentContentArea>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <CommentWriter>{comment.writerName}</CommentWriter>
            <CommentDate>{comment.createdAt}</CommentDate>
          </div>

          {isEditing ? (
            <EditBox>
              <input value={editText} onChange={(e) => setEditText(e.target.value)} autoFocus />
              <button onClick={handleUpdate} className="save">저장</button>
              <button onClick={() => setIsEditing(false)} className="cancel">취소</button>
            </EditBox>
          ) : (
            <CommentBody>{comment.content}</CommentBody>
          )}

          {!isEditing && (
            <ActionLinks>
              <TextBtn onClick={() => setIsReplying(!isReplying)}>답글 달기</TextBtn>
              {isMyComment && (
                <>
                  <Divider>|</Divider>
                  <TextBtn onClick={() => setIsEditing(true)}>수정</TextBtn>
                  <Divider>|</Divider>
                  <TextBtn onClick={handleDelete} $isDelete>삭제</TextBtn>
                </>
              )}
            </ActionLinks>
          )}
        </CommentContentArea>
      </CommentRow>

      {isReplying && (
        <ReplyInputWrapper>
          <input 
            type="text" placeholder="답글을 입력하세요..." autoFocus 
            value={replyText} onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.nativeEvent.isComposing && handleSubmitReply()}
          />
          <button onClick={handleSubmitReply}>등록</button>
        </ReplyInputWrapper>
      )}

      {comment.children && comment.children.length > 0 && (
        <ChildCommentWrapper>
          {comment.children.map(child => (
            <FeedCommentItem 
              key={child.id} comment={child} feedId={feedId} 
              onReplySubmit={onReplySubmit} refreshFeeds={refreshFeeds}
            />
          ))}
        </ChildCommentWrapper>
      )}
    </CommentContainer>
  );
};

// 메인 페이지
const FeedPage = () => {
  const { user } = useContext(UserContext);
  const [feeds, setFeeds] = useState([]);
  const [tab, setTab] = useState("global");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [content, setContent] = useState("");
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviewUrls, setNewPreviewUrls] = useState([]);
  const [activeCommentId, setActiveCommentId] = useState(null);
  const [commentText, setCommentText] = useState("");
  const fileInputRef = useRef(null);

  const fetchFeeds = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/feed?type=${tab}`);
      setFeeds(res.data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchFeeds(); }, [tab, user]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setNewFiles(prev => [...prev, ...selectedFiles]);
    const urls = selectedFiles.map(file => URL.createObjectURL(file));
    setNewPreviewUrls(prev => [...prev, ...urls]);
  };

  const removeNewImage = (index) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
    setNewPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingImage = async (imageId) => {
    if (!window.confirm("삭제할까요?")) return;
    try {
      await axios.delete(`/api/feed/image/${imageId}`);
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
    } catch (err) { alert("삭제 실패"); }
  };

  const handleSubmit = async () => {
    if (!user) return alert("로그인 필요");
    if (!content.trim() && newFiles.length === 0) return;
    const formData = new FormData();
    formData.append("data", new Blob([JSON.stringify({ content })], { type: "application/json" }));
    newFiles.forEach(file => formData.append("files", file));
    try {
      if (editMode) { await axios.put(`/api/feed/${editId}`, formData); alert("수정되었습니다."); } 
      else { await axios.post('/api/feed', formData); }
      closeModal(); fetchFeeds();
    } catch (err) { alert("처리 실패"); }
  };

  const closeModal = () => { setIsModalOpen(false); setEditMode(false); setContent(""); setExistingImages([]); setNewFiles([]); setNewPreviewUrls([]); };
  const handleEditClick = (feed) => { setEditMode(true); setEditId(feed.id); setContent(feed.content); setExistingImages(feed.images || []); setIsModalOpen(true); };
  const handleHeart = async (feedId) => { try { const res = await axios.post(`/api/feed/${feedId}/heart`); setFeeds(prev => prev.map(f => f.id === feedId ? { ...f, isHearted: res.data, heartCount: res.data ? f.heartCount + 1 : f.heartCount - 1 } : f)); } catch (err) {} };
  const handleDelete = async (feedId) => { if (!window.confirm("삭제?")) return; try { await axios.delete(`/api/feed/${feedId}`); setFeeds(prev => prev.filter(f => f.id !== feedId)); } catch (err) {} };
  const handleFollow = async (email) => { try { const res = await axios.post(`/api/feed/follow/${email}`); setFeeds(prev => prev.map(f => f.writerEmail === email ? { ...f, isFollowed: res.data } : f)); } catch (err) {} };
  const handleRetweet = async (feedId) => { if (!window.confirm("리트윗?")) return; try { await axios.post(`/api/feed/${feedId}/retweet`); alert("리트윗 완료"); fetchFeeds(); } catch (err) {} };
  const handleCommentSubmit = async (feedId, text, parentId = null) => { try { await axios.post(`/api/feed/${feedId}/comment`, { content: text, parentId }); setCommentText(""); fetchFeeds(); } catch (err) { alert("작성 실패"); } };

  return (
    <Wrapper>
      <Container>
        <Tabs>
          <Tab $active={tab === 'global'} onClick={() => setTab('global')}>🌏 전체</Tab>
          <Tab $active={tab === 'following'} onClick={() => setTab('following')}>🤝 팔로잉</Tab>
        </Tabs>

        <FeedList>
          {feeds.map(feed => {
            const isRetweet = !!feed.originalFeed;
            const displayFeed = isRetweet ? feed.originalFeed : feed;
            return (
              <FeedCard key={feed.id}>
                {isRetweet && <RetweetHeader><FaRetweet /> <span>{feed.writerName}님이 리트윗함</span></RetweetHeader>}
                <div style={{display:'flex', gap: 16}}>
                  <ProfileArea>
                    {displayFeed.writerProfile ? <ProfileImg src={`http://localhost:8080${displayFeed.writerProfile}`} /> : <FaUserCircle size={40} color="#888" />}
                  </ProfileArea>
                  <ContentArea>
                    <Header>
                      <WriterInfo>
                        <Name>{displayFeed.writerName}</Name>
                        <DateStr>{displayFeed.createdAt}</DateStr>
                        {user && user.email !== displayFeed.writerEmail && <FollowBtn onClick={() => handleFollow(displayFeed.writerEmail)} $active={displayFeed.isFollowed}>{displayFeed.isFollowed ? "언팔로우" : "팔로우"}</FollowBtn>}
                      </WriterInfo>
                      {user && user.email === feed.writerEmail && (
                        <MenuArea>
                          {!isRetweet && <IconBtn onClick={() => handleEditClick(feed)}><FaPen size={12}/></IconBtn>}
                          <IconBtn onClick={() => handleDelete(feed.id)}><FaTrash size={12}/></IconBtn>
                        </MenuArea>
                      )}
                    </Header>
                    <Text>{displayFeed.content}</Text>
                    {displayFeed.images && displayFeed.images.length > 0 && (
                      <ImageGrid $count={displayFeed.images.length}>
                        {displayFeed.images.map((img) => <FeedImg key={img.id} src={`http://localhost:8080${img.url}`} />)}
                      </ImageGrid>
                    )}
                    <Footer>
                      <ActionBtn onClick={() => setActiveCommentId(activeCommentId === feed.id ? null : feed.id)}><FaRegComment /> <span>{displayFeed.comments ? displayFeed.comments.length : 0}</span></ActionBtn>
                      <ActionBtn onClick={() => handleRetweet(displayFeed.id)} title="리트윗"><FaRetweet /> <span>0</span></ActionBtn>
                      <ActionBtn onClick={() => handleHeart(displayFeed.id)} $active={displayFeed.isHearted} $color="red">{displayFeed.isHearted ? <FaHeart /> : <FaRegHeart />} <span>{displayFeed.heartCount}</span></ActionBtn>
                    </Footer>
                    {activeCommentId === feed.id && (
                      <CommentSection>
                        <CommentInput>
                          <input type="text" placeholder="댓글 입력..." value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.nativeEvent.isComposing && handleCommentSubmit(displayFeed.id, commentText)} />
                          <button onClick={() => handleCommentSubmit(displayFeed.id, commentText)}>등록</button>
                        </CommentInput>
                        <CommentList>
                          {displayFeed.comments && displayFeed.comments.map(c => <FeedCommentItem key={c.id} comment={c} feedId={displayFeed.id} onReplySubmit={handleCommentSubmit} refreshFeeds={fetchFeeds} />)}
                        </CommentList>
                      </CommentSection>
                    )}
                  </ContentArea>
                </div>
              </FeedCard>
            );
          })}
          {feeds.length === 0 && <EmptyMsg>표시할 피드가 없습니다.</EmptyMsg>}
        </FeedList>

        {user && <FloatingBtn onClick={() => { setIsModalOpen(true); setEditMode(false); }}><FaPen /></FloatingBtn>}

        {isModalOpen && (
          <ModalOverlay onClick={closeModal}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader><h3>{editMode ? "수정" : "작성"}</h3><CloseBtn onClick={closeModal}><FaTimes /></CloseBtn></ModalHeader>
              <WriteInput value={content} onChange={(e) => setContent(e.target.value)} autoFocus />
              {editMode && existingImages.length > 0 && (
                <div style={{marginBottom: 10, display:'flex', gap: 5}}>
                  {existingImages.map((img) => (
                    <div key={img.id} style={{position:'relative', width:80, height:80}}>
                      <img src={`http://localhost:8080${img.url}`} style={{width:'100%', height:'100%', objectFit:'cover', borderRadius:8}} />
                      <button style={{position:'absolute', top:0, right:0, background:'red', color:'white', borderRadius:'50%', border:'none', width:20, height:20, cursor:'pointer'}} onClick={() => handleDeleteExistingImage(img.id)}>x</button>
                    </div>
                  ))}
                </div>
              )}
              {newPreviewUrls.length > 0 && <PreviewList>{newPreviewUrls.map((url, i) => <PreviewItem key={i}><img src={url} /><button onClick={() => removeNewImage(i)}><FaTimes /></button></PreviewItem>)}</PreviewList>}
              <ModalFooter><IconButton onClick={() => fileInputRef.current.click()}><FaRegImage size={24}/></IconButton><input type="file" multiple ref={fileInputRef} onChange={handleFileChange} hidden /><PostBtn onClick={handleSubmit}>{editMode ? "수정" : "게시"}</PostBtn></ModalFooter>
            </ModalContent>
          </ModalOverlay>
        )}
      </Container>
    </Wrapper>
  );
};

export default FeedPage;

// --- 스타일 정의 ---
const Wrapper = styled.div` width: 100%; display: flex; justify-content: center; /* 중앙 정렬 */ `;

// ★ 여기가 핵심! 너비를 넓힘 (900px)
const Container = styled.div` 
  width: 100%; 
  max-width: 900px; /* 650px -> 900px로 변경! */
  min-height: 100vh;
  border-right: 1px solid ${props => props.theme.border};
  border-left: 1px solid ${props => props.theme.border};
`;

const Tabs = styled.div` display: flex; border-bottom: 1px solid ${props => props.theme.border}; position: sticky; top: 0; background: ${props => props.theme.bg}CC; z-index: 10; backdrop-filter: blur(10px); `;
const Tab = styled.div` flex: 1; text-align: center; padding: 15px; cursor: pointer; font-weight: bold; color: ${props => props.$active ? props.theme.text : props.theme.subText}; border-bottom: 3px solid ${props => props.$active ? props.theme.active : 'transparent'}; &:hover { background: ${props => props.theme.hover}; } `;
const FeedList = styled.div``;
const FeedCard = styled.div` display: flex; flex-direction: column; gap: 8px; padding: 20px; border-bottom: 1px solid ${props => props.theme.border}; &:hover { background: ${props => props.theme.hover}; } `;
const RetweetHeader = styled.div` display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: bold; color: ${props => props.theme.subText}; margin-bottom: 4px; margin-left: 50px; svg { font-size: 14px; } `;
const ProfileArea = styled.div` width: 50px; flex-shrink: 0; `;
const ProfileImg = styled.img` width: 50px; height: 50px; border-radius: 50%; object-fit: cover; `;
const ContentArea = styled.div` flex: 1; min-width: 0; `;
const Header = styled.div` display: flex; justify-content: space-between; margin-bottom: 6px; align-items: center; `;
const WriterInfo = styled.div` display: flex; gap: 10px; align-items: baseline; `;
const Name = styled.span` font-weight: bold; font-size: 16px; color: ${props => props.theme.text}; `;
const DateStr = styled.span` font-size: 13px; color: ${props => props.theme.subText}; `;
const FollowBtn = styled.button` background: ${props => props.$active ? 'transparent' : props.theme.text}; color: ${props => props.$active ? props.theme.text : props.theme.bg}; border: 1px solid ${props => props.theme.text}; border-radius: 15px; padding: 3px 12px; font-size: 11px; font-weight: bold; cursor: pointer; &:hover { opacity: 0.8; } `;
const MenuArea = styled.div` display: flex; gap: 8px; `;
const IconBtn = styled.button` background: none; border: none; color: ${props => props.theme.subText}; cursor: pointer; padding: 5px; &:hover { color: ${props => props.theme.text}; } `;
const Text = styled.div` white-space: pre-wrap; margin-bottom: 15px; font-size: 16px; line-height: 1.6; color: ${props => props.theme.text}; word-break: break-word; `;
const ImageGrid = styled.div` display: grid; gap: 10px; margin-bottom: 15px; border-radius: 12px; overflow: hidden; border: 1px solid ${props => props.theme.border}; grid-template-columns: ${props => props.$count === 1 ? '1fr' : '1fr 1fr'}; `;
const FeedImg = styled.img` width: 100%; height: auto; max-height: 500px; object-fit: cover; background-color: #000; `;
const Footer = styled.div` display: flex; justify-content: flex-start; gap: 50px; margin-top: 10px; `;
const ActionBtn = styled.button` background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 8px; color: ${props => props.$active ? (props.$color || props.theme.active) : props.theme.subText}; font-size: 14px; &:hover { color: ${props => props.$color || props.theme.active}; } svg { font-size: 18px; } `;
const EmptyMsg = styled.div` padding: 40px; text-align: center; color: ${props => props.theme.subText}; `;
const FloatingBtn = styled.button` position: fixed; bottom: 80px; right: 40px; width: 60px; height: 60px; border-radius: 50%; background-color: ${props => props.theme.active}; color: #121212; border: none; box-shadow: 0 4px 12px rgba(0,0,0,0.4); font-size: 24px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 100; &:hover { transform: scale(1.05); } `;
const ModalOverlay = styled.div` position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 2000; display: flex; align-items: center; justify-content: center; `;
const ModalContent = styled.div` width: 90%; max-width: 600px; background: ${props => props.theme.cardBg}; border-radius: 16px; padding: 20px; border: 1px solid ${props => props.theme.border}; `;
const ModalHeader = styled.div` display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; h3 { margin: 0; color: ${props => props.theme.text}; } `;
const CloseBtn = styled.button` background: none; border: none; color: ${props => props.theme.text}; cursor: pointer; font-size: 20px; `;
const WriteInput = styled.textarea` width: 100%; height: 150px; border: none; background: transparent; resize: none; font-size: 18px; color: ${props => props.theme.text}; outline: none; margin-bottom: 20px; &::placeholder { color: ${props => props.theme.subText}; } `;
const ModalFooter = styled.div` display: flex; justify-content: space-between; align-items: center; border-top: 1px solid ${props => props.theme.border}; padding-top: 15px; `;
const IconButton = styled.button` background: none; border: none; color: ${props => props.theme.active}; cursor: pointer; padding: 8px; border-radius: 50%; &:hover { background: ${props => props.theme.hover}; } `;
const PostBtn = styled.button` background: ${props => props.theme.active}; color: #121212; border: none; padding: 10px 24px; border-radius: 24px; font-weight: bold; cursor: pointer; &:disabled { opacity: 0.5; cursor: default; } `;
const PreviewList = styled.div` display: flex; gap: 10px; overflow-x: auto; margin-bottom: 15px; `;
const PreviewItem = styled.div` position: relative; width: 100px; height: 100px; flex-shrink: 0; img { width: 100%; height: 100%; object-fit: cover; border-radius: 8px; } button { position: absolute; top: 0; right: 0; background: rgba(0,0,0,0.6); color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 10px; } `;
const CommentSection = styled.div` margin-top: 15px; padding-top: 15px; border-top: 1px solid ${props => props.theme.border}; `;
const CommentInput = styled.div` display: flex; gap: 10px; margin-bottom: 20px; input { flex: 1; padding: 10px 15px; border-radius: 20px; border: 1px solid ${props => props.theme.border}; background: transparent; color: ${props => props.theme.text}; outline: none; &:focus { border-color: ${props => props.theme.active}; } } button { background: ${props => props.theme.active}; color: #121212; border: none; padding: 0 18px; border-radius: 20px; font-size: 13px; font-weight: bold; cursor: pointer; } `;
const CommentList = styled.div` display: flex; flex-direction: column; gap: 15px; `;
const CommentContainer = styled.div` display: flex; flex-direction: column; width: 100%; `;
const CommentRow = styled.div` display: flex; width: 100%; `;
const CommentContentArea = styled.div` flex: 1; `;
const CommentWriter = styled.span` font-weight: bold; font-size: 14px; color: ${props => props.theme.text}; `;
const CommentDate = styled.span` font-size: 11px; color: ${props => props.theme.subText}; margin-left: 5px; `;
const CommentBody = styled.div` font-size: 14px; color: ${props => props.theme.text}; margin-top: 2px; line-height: 1.4; `;
const ActionLinks = styled.div` display: flex; align-items: center; gap: 8px; margin-top: 6px; font-size: 11px; `;
const TextBtn = styled.span` color: ${props => props.$isDelete ? '#ff6b6b' : props.theme.subText}; cursor: pointer; &:hover { text-decoration: underline; color: ${props => props.$isDelete ? '#ff6b6b' : props.theme.text}; } `;
const Divider = styled.span` color: ${props => props.theme.border}; font-size: 10px; `;
const ReplyInputWrapper = styled.div` display: flex; gap: 8px; margin-top: 8px; margin-bottom: 8px; margin-left: 10px; input { flex: 1; padding: 6px 12px; border-radius: 15px; border: 1px solid ${props => props.theme.border}; background: transparent; color: ${props => props.theme.text}; outline: none; font-size: 13px; } button { background: ${props => props.theme.active}; color: #121212; border: none; padding: 0 12px; border-radius: 15px; font-size: 11px; font-weight: bold; cursor: pointer; } `;
const ChildCommentWrapper = styled.div` margin-left: 15px; padding-left: 10px; border-left: 2px solid ${props => props.theme.border}; margin-top: 10px; display: flex; flex-direction: column; gap: 12px; `;
const EditBox = styled.div` display: flex; gap: 5px; margin-top: 5px; margin-bottom: 5px; input { flex: 1; padding: 6px; border-radius: 4px; border: 1px solid ${props => props.theme.active}; background: ${props => props.theme.bg}; color: ${props => props.theme.text}; } button { font-size: 11px; padding: 4px 8px; border-radius: 4px; border: none; cursor: pointer; font-weight: bold; } .save { background: ${props => props.theme.active}; color: #121212; } .cancel { background: transparent; border: 1px solid ${props => props.theme.border}; color: ${props => props.theme.text}; } `;