import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { UserContext } from '../context/UserContext';
import { FaArrowLeft, FaRegEye, FaUserCircle, FaClock, FaReply, FaTrash, FaEdit } from "react-icons/fa";

// ★ 재귀형 댓글 컴포넌트
const CommentItem = ({ comment, boardId, onReplySubmit }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");

  const handleSubmit = () => {
    if (!replyText.trim()) return;
    onReplySubmit(replyText, comment.id);
    setIsReplying(false);
    setReplyText("");
  };

  return (
    <CommentBox>
      <CommentHeader>
        <WriterName>{comment.writerName}</WriterName>
        <CommentDate>{comment.createdAt}</CommentDate>
      </CommentHeader>
      
      <CommentBody>{comment.content}</CommentBody>
      
      <ReplyBtn onClick={() => setIsReplying(!isReplying)}>
        <FaReply /> 답글
      </ReplyBtn>

      {isReplying && (
        <ReplyInputBox>
          <input 
            type="text" 
            placeholder="답글을 입력하세요..." 
            autoFocus
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <button onClick={handleSubmit}>등록</button>
        </ReplyInputBox>
      )}

      {comment.children && comment.children.length > 0 && (
        <ChildComments>
          {comment.children.map(child => (
            <CommentItem 
              key={child.id} 
              comment={child} 
              boardId={boardId} 
              onReplySubmit={onReplySubmit} 
            />
          ))}
        </ChildComments>
      )}
    </CommentBox>
  );
};

// ★ 메인 상세 페이지 컴포넌트
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
      alert("존재하지 않거나 삭제된 글입니다.");
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
    } catch (err) {
      alert("본인이 작성한 글만 삭제할 수 있습니다.");
    }
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
    } catch (err) {
      alert("댓글 등록 실패");
    }
  };

  if (loading) return <LoadingText>로딩중...</LoadingText>;
  if (!post) return null;

  // 내 글인지 확인
  const isMyPost = user && post.writerEmail === user.email;

  return (
    <Container>
      <TopBar>
        <BackButton onClick={() => navigate('/board')}>
          <FaArrowLeft /> 목록으로
        </BackButton>

        {/* 내 글일 때만 수정/삭제 버튼 보임 */}
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
          {/* ★ 수정된 부분: images 배열 순회 (백엔드 DTO 변경 반영) */}
          {post.images && post.images.map((img) => (
            <PostImage 
              key={img.id} 
              src={`http://localhost:8080${img.url}`} 
              alt="첨부 이미지" 
            />
          ))}
          <TextContent>{post.content}</TextContent>
        </Body>
      </ContentBox>

      <CommentSection>
        <h3>댓글 {post.replies?.length || 0}개</h3>
        
        <MainCommentInput>
          <input 
            type="text" 
            placeholder={user ? "댓글을 남겨보세요" : "로그인 후 작성 가능합니다"} 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={!user}
            onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit(newComment)}
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
            />
          ))}
        </CommentList>
      </CommentSection>
    </Container>
  );
};

export default BoardDetailPage;

// --- 스타일 정의 (네가 준 코드 그대로) ---
const Container = styled.div` max-width: 900px; margin: 0 auto; padding: 20px; `;
const TopBar = styled.div` display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; `;
const BackButton = styled.button` background: none; border: none; color: ${props => props.theme.subText}; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 5px; &:hover { color: ${props => props.theme.active}; } `;
const BtnGroup = styled.div` display: flex; gap: 10px; `;
const ActionBtn = styled.button`
  background: none; border: 1px solid ${props => props.theme.border};
  color: ${props => props.$danger ? '#ff6b6b' : props.theme.subText};
  padding: 5px 10px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 5px; font-size: 13px;
  &:hover { background: ${props => props.theme.hover}; }
`;

const ContentBox = styled.div` background-color: ${props => props.theme.cardBg}; border: 1px solid ${props => props.theme.border}; border-radius: 12px; padding: 30px; margin-bottom: 20px; `;
const Header = styled.div` margin-bottom: 20px; `;
const CategoryBadge = styled.span` display: inline-block; background-color: ${props => props.theme.active}; color: #121212; font-size: 12px; font-weight: bold; padding: 4px 8px; border-radius: 4px; margin-bottom: 10px; `;
const Title = styled.h1` font-size: 24px; font-weight: bold; color: ${props => props.theme.text}; margin-bottom: 15px; line-height: 1.4; `;
const MetaInfo = styled.div` display: flex; gap: 15px; color: ${props => props.theme.subText}; font-size: 13px; `;
const MetaItem = styled.span` display: flex; align-items: center; gap: 5px; `;
const Divider = styled.hr` border: none; border-top: 1px solid ${props => props.theme.border}; margin: 20px 0; `;
const Body = styled.div` color: ${props => props.theme.text}; `;
const PostImage = styled.img` max-width: 100%; border-radius: 8px; margin-bottom: 20px; border: 1px solid ${props => props.theme.border}; `;
const TextContent = styled.pre` white-space: pre-wrap; font-family: inherit; font-size: 16px; line-height: 1.8; color: ${props => props.theme.text}; `;
const LoadingText = styled.div` text-align: center; padding: 50px; color: gray; `;

const CommentSection = styled.div` background-color: ${props => props.theme.cardBg}; border: 1px solid ${props => props.theme.border}; border-radius: 12px; padding: 20px; h3 { font-size: 18px; margin-bottom: 15px; color: ${props => props.theme.text}; } `;
const MainCommentInput = styled.div` display: flex; gap: 10px; margin-bottom: 30px; input { flex: 1; padding: 12px; border-radius: 8px; border: 1px solid ${props => props.theme.border}; background: ${props => props.theme.bg}; color: ${props => props.theme.text}; } button { padding: 0 20px; border-radius: 8px; border: none; background: ${props => props.theme.active}; font-weight: bold; cursor: pointer; &:disabled { opacity: 0.5; } } `;
const CommentList = styled.div` display: flex; flex-direction: column; gap: 20px; `;
const CommentBox = styled.div` display: flex; flex-direction: column; `;
const CommentHeader = styled.div` display: flex; gap: 10px; align-items: center; margin-bottom: 5px; `;
const WriterName = styled.span` font-weight: bold; font-size: 14px; color: ${props => props.theme.text}; `;
const CommentDate = styled.span` font-size: 12px; color: ${props => props.theme.subText}; `;
const CommentBody = styled.div` font-size: 14px; color: ${props => props.theme.text}; margin-bottom: 8px; line-height: 1.5; `;
const ReplyBtn = styled.button` background: none; border: none; color: ${props => props.theme.subText}; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 4px; padding: 0; width: fit-content; &:hover { color: ${props => props.theme.active}; } `;
const ChildComments = styled.div` margin-left: 20px; margin-top: 15px; padding-left: 15px; border-left: 2px solid ${props => props.theme.border}; display: flex; flex-direction: column; gap: 15px; `;
const ReplyInputBox = styled.div` display: flex; gap: 10px; margin-top: 10px; margin-bottom: 10px; input { flex: 1; padding: 8px; border-radius: 6px; border: 1px solid ${props => props.theme.border}; background: ${props => props.theme.bg}; color: ${props => props.theme.text}; font-size: 13px; } button { padding: 0 15px; border-radius: 6px; border: none; background: ${props => props.theme.border}; color: ${props => props.theme.text}; font-size: 12px; cursor: pointer; &:hover { background: ${props => props.theme.active}; color: black; } } `;