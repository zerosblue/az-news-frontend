import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { UserContext } from '../context/UserContext';
import { FaArrowLeft, FaExternalLinkAlt, FaRegCommentDots, FaUserCircle } from "react-icons/fa";
import { Helmet } from 'react-helmet-async';

const NewsDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");

  // 1. 뉴스 상세 정보 (+댓글) 가져오기
  const fetchDetail = async () => {
    try {
      const res = await axios.get(`/api/news/${id}`);
      setNews(res.data);
    } catch (err) {
      console.error("뉴스 로딩 실패", err);
      alert("존재하지 않는 뉴스입니다.");
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDetail(); }, [id]);

  // 2. 댓글 작성
  const handleCommentSubmit = async () => {
    if (!user) return alert("로그인이 필요합니다.");
    if (!commentText.trim()) return;

    try {
      await axios.post(`/api/news/${id}/comment`, { content: commentText });
      setCommentText(""); // 입력창 비우기
      fetchDetail(); // 댓글 목록 갱신을 위해 다시 불러옴
    } catch (err) {
      alert("댓글 작성 실패");
    }
  };

  if (loading) return <LoadingText>뉴스를 불러오는 중...</LoadingText>;
  if (!news) return null;

  return (
    <Container>
      {/* ★ SEO 설정: 브라우저 탭 제목을 뉴스 제목으로 변경 */}
      <Helmet>
        <title>{news.title} - AZ News</title>
        <meta name="description" content={news.description ? news.description.substring(0, 100) : "뉴스 요약"} />
      </Helmet>
      {/* 상단 네비게이션 */}
      <TopBar>
        <BackButton onClick={() => navigate(-1)}>
          <FaArrowLeft /> 뒤로가기
        </BackButton>
      </TopBar>
      

      <ContentBox>
        {/* 뉴스 헤더 */}
        <NewsHeader>
          <CategoryBadge>{news.category || '뉴스'}</CategoryBadge>
          <NewsTitle>{news.title}</NewsTitle>
          <NewsMeta>
            <span>{news.provider}</span>
            <span>{news.pubDate}</span>
          </NewsMeta>
        </NewsHeader>

        <Divider />

        {/* 뉴스 본문 (요약 & 링크) */}
        <NewsBody>
          <SummaryText>
            {/* description이 있으면 보여주고, 없으면 기존 안내 문구 보여줌 */}
            {news.description ? (
              <div dangerouslySetInnerHTML={{ __html: news.description }} />
            ) : (
              <>
                이 뉴스는 <b>{news.provider}</b>에서 제공한 기사입니다.<br/>
                아래 버튼을 눌러 전체 내용을 확인하고, 여기서는 자유롭게 토론해보세요!
              </>
            )}
          </SummaryText>
          
          <LinkButton onClick={() => window.open(news.link, '_blank')}>
            기사 원문 전체보기 <FaExternalLinkAlt />
          </LinkButton>
        </NewsBody>
      </ContentBox>

      {/* 댓글 섹션 */}
      <CommentSection>
        <h3><FaRegCommentDots /> 토론장 ({news.comments ? news.comments.length : 0})</h3>
        
        {/* 댓글 입력 */}
        <CommentInput>
          <input 
            type="text" 
            placeholder={user ? "이 뉴스에 대한 의견을 남겨주세요!" : "로그인 후 의견을 남길 수 있습니다."} 
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            disabled={!user}
            onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit()}
          />
          <button onClick={handleCommentSubmit} disabled={!user}>등록</button>
        </CommentInput>

        {/* 댓글 리스트 */}
        <CommentList>
          {news.comments && news.comments.map((c) => (
            <CommentItem key={c.id}>
              <div className="info">
                <FaUserCircle className="icon" />
                <span className="writer">{c.writerName}</span>
                <span className="date">{c.createdAt}</span>
              </div>
              <div className="text">{c.content}</div>
            </CommentItem>
          ))}
          {news.comments && news.comments.length === 0 && (
            <EmptyMsg>아직 작성된 의견이 없습니다. 첫 번째 의견을 남겨보세요!</EmptyMsg>
          )}
        </CommentList>
      </CommentSection>
    </Container>
  );
};

export default NewsDetailPage;

// --- 스타일 정의 ---
const Container = styled.div` max-width: 800px; margin: 0 auto; padding: 20px; color: ${props => props.theme.text}; `;
const TopBar = styled.div` margin-bottom: 20px; `;
const BackButton = styled.button` background: none; border: none; color: ${props => props.theme.subText}; cursor: pointer; display: flex; align-items: center; gap: 5px; font-size: 14px; &:hover { color: ${props => props.theme.active}; } `;
const ContentBox = styled.div` background-color: ${props => props.theme.cardBg}; border: 1px solid ${props => props.theme.border}; border-radius: 16px; padding: 30px; margin-bottom: 30px; `;
const NewsHeader = styled.div` display: flex; flex-direction: column; gap: 10px; `;
const CategoryBadge = styled.span` display: inline-block; background-color: ${props => props.theme.active}; color: #121212; font-size: 12px; font-weight: bold; padding: 4px 8px; border-radius: 4px; align-self: flex-start; `;
const NewsTitle = styled.h1` font-size: 22px; font-weight: bold; line-height: 1.4; `;
const NewsMeta = styled.div` font-size: 13px; color: ${props => props.theme.subText}; display: flex; gap: 15px; `;
const Divider = styled.hr` border: none; border-top: 1px solid ${props => props.theme.border}; margin: 20px 0; `;
const NewsBody = styled.div` display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 20px 0; `;
const SummaryText = styled.p` text-align: center; color: ${props => props.theme.subText}; line-height: 1.6; `;
const LinkButton = styled.button` background-color: ${props => props.theme.active}; color: #121212; border: none; padding: 12px 24px; border-radius: 30px; font-weight: bold; font-size: 16px; cursor: pointer; display: flex; align-items: center; gap: 8px; &:hover { opacity: 0.9; } `;
const CommentSection = styled.div` background-color: ${props => props.theme.cardBg}; border: 1px solid ${props => props.theme.border}; border-radius: 16px; padding: 20px; h3 { font-size: 18px; margin-bottom: 15px; display: flex; align-items: center; gap: 8px; } `;
const CommentInput = styled.div` display: flex; gap: 10px; margin-bottom: 20px; input { flex: 1; padding: 12px; border-radius: 8px; border: 1px solid ${props => props.theme.border}; background: ${props => props.theme.bg}; color: ${props => props.theme.text}; outline: none; &:focus { border-color: ${props => props.theme.active}; } } button { padding: 0 20px; border-radius: 8px; border: none; background: ${props => props.theme.active}; font-weight: bold; cursor: pointer; &:disabled { opacity: 0.5; } } `;
const CommentList = styled.div` display: flex; flex-direction: column; gap: 15px; `;
const CommentItem = styled.div` border-bottom: 1px solid ${props => props.theme.border}; padding-bottom: 15px; &:last-child { border-bottom: none; } .info { display: flex; align-items: center; gap: 8px; margin-bottom: 5px; color: ${props => props.theme.subText}; font-size: 13px; .icon { font-size: 20px; } .writer { font-weight: bold; color: ${props => props.theme.text}; } } .text { padding-left: 28px; line-height: 1.4; } `;
const EmptyMsg = styled.div` text-align: center; padding: 20px; color: ${props => props.theme.subText}; font-size: 14px; `;
const LoadingText = styled.div` text-align: center; padding: 50px; color: gray; `;