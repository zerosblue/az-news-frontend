import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { UserContext } from '../context/UserContext';
import { FaArrowLeft, FaRegEye, FaUserCircle, FaClock, FaReply, FaTrash, FaEdit } from "react-icons/fa";

// --- [댓글 아이템 컴포넌트] ---
const CommentItem = ({ comment, boardId, onReplySubmit, refreshFeeds }) => {
  const { user } = useContext(UserContext);
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [editText, setEditText] = useState(comment.content);

  const handleSubmitReply = () => {
    if (!replyText.trim()) return;
    onReplySubmit(replyText, comment.id);
    setIsReplying(false);
    setReplyText("");
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`/api/feed/comment/${comment.id}`, { content: editText });
      setIsEditing(false);
      refreshFeeds();
    } catch (err) { alert("수정 실패"); }
  };

  const handleDelete = async () => {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`/api/feed/comment/${comment.id}`);
      refreshFeeds();
    } catch (err) { alert("삭제 실패"); }
  };

  const isMyComment = user && (user.nickname === comment.writerName || user.name === comment.writerName);

  return (
    <CommentBox>
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
              <VerticalBar>|</VerticalBar>
              <TextBtn onClick={() => setIsEditing(true)}>수정</TextBtn>
              <VerticalBar>|</VerticalBar>
              <TextBtn onClick={handleDelete} $isDelete>삭제</TextBtn>
            </>
          )}
        </ActionLinks>
      )}
      {isReplying && (
        <ReplyInputWrapper>
          <input 
            type="text" placeholder="답글 입력..." autoFocus 
            value={replyText} onChange={(e) => setReplyText(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && !e.nativeEvent.isComposing && handleSubmitReply()} 
          />
          <button onClick={handleSubmitReply}>등록</button>
        </ReplyInputWrapper>
      )}
      {comment.children && comment.children.length > 0 && (
        <ChildCommentWrapper>
          {comment.children.map(child => (
            <CommentItem 
              key={child.id} 
              comment={child} 
              boardId={boardId} 
              onReplySubmit={onReplySubmit} 
              refreshFeeds={refreshFeeds} 
            />
          ))}
        </ChildCommentWrapper>
      )}
    </CommentBox>
  );
};

// --- [메인 상세 페이지 컴포넌트] ---
const BoardDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");

  const fetchDetail = async () => {
    try {
      const res = await axios.get(`/api/board/${id}`);
      setPost(res.data);
    } catch (err) {
      alert("글을 불러올 수 없습니다.");
      navigate('/board');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDetail(); }, [id]);

  const handleDeletePost = async () => {
    if (!window.confirm("정말 이 글을 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`/api/board/${id}`);
      alert("삭제되었습니다.");
      navigate('/board');
    } catch (err) { alert("삭제 권한이 없습니다."); }
  };

  const handleEditPost = () => {
    navigate(`/board/edit/${id}`);
  };

  const handleCommentSubmit = async (content, parentId = null) => {
    if (!user) return alert("로그인이 필요합니다.");
    try {
      await axios.post(`/api/board/${id}/reply`, { content, parentId });
      setNewComment(""); 
      fetchDetail();
    } catch (err) { alert("댓글 등록 실패"); }
  };

  if (loading) return <LoadingText>로딩중...</LoadingText>;
  if (!post) return null;

  const isMyPost = user && post.writerEmail === user.email;

  return (
    <Container>
      <TopBar>
        <BackButton onClick={() => navigate('/board')}>
          <FaArrowLeft /> 목록으로
        </BackButton>

        {isMyPost && (
          <BtnGroup>
            <ActionBtn onClick={handleEditPost}><FaEdit /> 수정</ActionBtn>
            <ActionBtn onClick={handleDeletePost} $danger><FaTrash /> 삭제</ActionBtn>
          </BtnGroup>
        )}
      </TopBar>

      <ContentBox>
        <Header>
          <CategoryBadge>{post.category}</CategoryBadge>
          <Title>{post.title}</Title>
          <MetaInfo>
            <MetaItem><FaUserCircle /> {post.writerName}</MetaItem>
            <MetaItem><FaClock /> {post.createdAt}</MetaItem>
            <MetaItem><FaRegEye /> {post.viewCount}</MetaItem>
          </MetaInfo>
        </Header>
        <Divider />
        <Body>
          {post.images && post.images.map((img) => (
            <PostImage key={img.id} src={`http://localhost:8080${img.url}`} alt="img" />
          ))}
          <TextContent>{post.content}</TextContent>
        </Body>
      </ContentBox>

      <CommentSection>
        <h3>댓글 {post.replies?.length || 0}개</h3>
        <MainCommentInput>
          <input 
            type="text" placeholder={user ? "댓글을 남겨보세요" : "로그인 후 작성 가능합니다"} 
            value={newComment} onChange={(e) => setNewComment(e.target.value)} disabled={!user}
            onKeyDown={(e) => e.key === 'Enter' && !e.nativeEvent.isComposing && handleCommentSubmit(newComment)}
          />
          <button onClick={() => handleCommentSubmit(newComment)} disabled={!user}>등록</button>
        </MainCommentInput>

        <CommentList>
          {post.replies && post.replies.map(reply => (
            <CommentItem 
              key={reply.id} 
              comment={reply} 
              boardId={id} 
              onReplySubmit={handleCommentSubmit} 
              refreshFeeds={fetchDetail} 
            />
          ))}
        </CommentList>
      </CommentSection>
    </Container>
  );
};

export default BoardDetailPage;

// --- 스타일 정의 ---
const Container = styled.div` max-width: 1200px; margin: 0 auto; padding: 20px; width: 100%; `;
const TopBar = styled.div` display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; `;
const BackButton = styled.button` background: none; border: none; color: ${props => props.theme.subText}; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 5px; &:hover { color: ${props => props.theme.active}; } `;
const BtnGroup = styled.div` display: flex; gap: 10px; `;
const ActionBtn = styled.button` background: none; border: 1px solid ${props => props.theme.border}; color: ${props => props.$danger ? '#ff6b6b' : props.theme.subText}; padding: 6px 12px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 5px; font-size: 13px; &:hover { background: ${props => props.theme.hover}; } `;
const ContentBox = styled.div` background-color: ${props => props.theme.cardBg}; border: 1px solid ${props => props.theme.border}; border-radius: 12px; padding: 40px; margin-bottom: 20px; `;
const Header = styled.div` margin-bottom: 20px; `;
const CategoryBadge = styled.span` display: inline-block; background-color: ${props => props.theme.active}; color: #121212; font-size: 12px; font-weight: bold; padding: 4px 8px; border-radius: 4px; margin-bottom: 10px; `;
const Title = styled.h1` font-size: 28px; font-weight: bold; color: ${props => props.theme.text}; margin-bottom: 15px; line-height: 1.4; `;
const MetaInfo = styled.div` display: flex; gap: 20px; color: ${props => props.theme.subText}; font-size: 14px; `;
const MetaItem = styled.span` display: flex; align-items: center; gap: 6px; `;
const Divider = styled.hr` border: none; border-top: 1px solid ${props => props.theme.border}; margin: 25px 0; `;
const Body = styled.div` color: ${props => props.theme.text}; `;
const PostImage = styled.img` max-width: 100%; border-radius: 12px; margin-bottom: 30px; border: 1px solid ${props => props.theme.border}; `;
const TextContent = styled.pre` white-space: pre-wrap; font-family: inherit; font-size: 17px; line-height: 1.8; color: ${props => props.theme.text}; `;
const LoadingText = styled.div` text-align: center; padding: 100px; color: gray; `;

// 댓글 섹션 스타일
const CommentSection = styled.div` background-color: ${props => props.theme.cardBg}; border: 1px solid ${props => props.theme.border}; border-radius: 12px; padding: 30px; h3 { font-size: 20px; margin-bottom: 20px; color: ${props => props.theme.text}; } `;
const MainCommentInput = styled.div` display: flex; gap: 12px; margin-bottom: 40px; input { flex: 1; padding: 14px; border-radius: 8px; border: 1px solid ${props => props.theme.border}; background: ${props => props.theme.bg}; color: ${props => props.theme.text}; font-size: 15px; } button { padding: 0 25px; border-radius: 8px; border: none; background: ${props => props.theme.active}; font-weight: bold; cursor: pointer; &:disabled { opacity: 0.5; } } `;
const CommentList = styled.div` display: flex; flex-direction: column; gap: 25px; `;
const CommentBox = styled.div` display: flex; flex-direction: column; `;
const CommentWriter = styled.span` font-weight: bold; font-size: 15px; color: ${props => props.theme.text}; `;
const CommentDate = styled.span` font-size: 12px; color: ${props => props.theme.subText}; margin-left: 8px; `;
const CommentBody = styled.div` font-size: 15px; color: ${props => props.theme.text}; margin-top: 6px; line-height: 1.5; `;
const ActionLinks = styled.div` display: flex; align-items: center; gap: 10px; margin-top: 8px; font-size: 12px; `;
const TextBtn = styled.span` color: ${props => props.$isDelete ? '#ff6b6b' : props.theme.subText}; cursor: pointer; &:hover { text-decoration: underline; color: ${props => props.$isDelete ? '#ff6b6b' : props.theme.text}; } `;

// ★ 이름을 DividerS에서 VerticalBar로 변경하여 충돌 해결
const VerticalBar = styled.span` color: ${props => props.theme.border}; font-size: 10px; `;

const ReplyInputWrapper = styled.div` display: flex; gap: 10px; margin-top: 10px; margin-left: 20px; input { flex: 1; padding: 8px 15px; border-radius: 20px; border: 1px solid ${props => props.theme.border}; background: transparent; color: ${props => props.theme.text}; font-size: 14px; } button { background: ${props => props.theme.active}; color: #121212; border: none; padding: 0 15px; border-radius: 20px; font-size: 12px; font-weight: bold; cursor: pointer; } `;
const ChildCommentWrapper = styled.div` margin-left: 30px; padding-left: 15px; border-left: 2px solid ${props => props.theme.border}; margin-top: 15px; display: flex; flex-direction: column; gap: 20px; `;
const EditBox = styled.div` display: flex; gap: 10px; margin-top: 8px; input { flex: 1; padding: 10px; border-radius: 4px; border: 1px solid ${props => props.theme.active}; background: ${props => props.theme.bg}; color: ${props => props.theme.text}; } button { padding: 6px 12px; border-radius: 6px; border: none; cursor: pointer; font-weight: bold; font-size: 13px; } .save { background: ${props => props.theme.active}; color: #121212; } .cancel { background: #555; color: white; } `;