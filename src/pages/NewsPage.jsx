import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import axios from '../api/axios';
import { UserContext } from '../context/UserContext';
import { FaPlus, FaTimes, FaBell } from "react-icons/fa";

const NewsPage = () => {
  const { user } = useContext(UserContext); // 로그인 정보
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 카테고리 상태 (전체, 주식, 코인, 부동산)
  const [category, setCategory] = useState("전체");
  
  // 키워드 관련 상태
  const [keywords, setKeywords] = useState([]);
  const [inputKeyword, setInputKeyword] = useState("");

  // 1. 뉴스 가져오기 (카테고리가 바뀔 때마다 실행)
  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/news`, {
          params: { category: category }
        });
        setNewsList(response.data);
      } catch (error) {
        console.error("뉴스 로딩 실패", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [category]);

  // 2. 내 키워드 가져오기 (로그인 했을 때만)
  useEffect(() => {
    if (user) {
      axios.get('/api/keywords').then(res => setKeywords(res.data));
    }
  }, [user]);

  // 키워드 추가 함수
  const handleAddKeyword = async () => {
    if (!inputKeyword.trim()) return;
    try {
      const res = await axios.post('/api/keywords', { keyword: inputKeyword });
      setKeywords(res.data);
      setInputKeyword(""); // 입력창 비우기
    } catch (err) {
      alert("키워드 추가 실패");
    }
  };

  // 키워드 삭제 함수
  const handleDeleteKeyword = async (keywordToDelete) => {
    try {
      const res = await axios.delete(`/api/keywords?keyword=${keywordToDelete}`);
      setKeywords(res.data);
    } catch (err) {
      alert("삭제 실패");
    }
  };

  return (
    <Container>
      
      {/* 1. 알림 키워드 설정 박스 (로그인 한 사람만 보임) */}
      {user && (
        <KeywordSection>
          <KeywordHeader>
            <FaBell color="#ffc107" />
            <h3>알림 키워드 설정</h3>
          </KeywordHeader>
          
          <InputBox>
            <input 
              type="text" 
              placeholder="알림받고 싶은 키워드를 입력하세요" 
              value={inputKeyword}
              onChange={(e) => setInputKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
            />
            <button onClick={handleAddKeyword}><FaPlus /></button>
          </InputBox>

          <KeywordList>
            {keywords.map((k, i) => (
              <KeywordTag key={i}>
                {k} 
                <span onClick={() => handleDeleteKeyword(k)}><FaTimes /></span>
              </KeywordTag>
            ))}
            {keywords.length === 0 && <EmptyText>등록된 키워드가 없습니다.</EmptyText>}
          </KeywordList>
        </KeywordSection>
      )}

      {/* 2. 뉴스 카테고리 탭 */}
      <CategoryTabs>
        {["전체", "주식", "코인", "부동산"].map((cat) => (
          <Tab 
            key={cat} 
            $active={category === cat} 
            onClick={() => setCategory(cat)}
          >
            {cat}
          </Tab>
        ))}
      </CategoryTabs>

      {/* 3. 뉴스 리스트 */}
      <NewsGrid>
        {loading ? <LoadingText>뉴스를 불러오는 중...</LoadingText> : (
          newsList.length > 0 ? newsList.map((news) => (
            <NewsCard key={news.id} onClick={() => window.open(news.link, '_blank')}>
              <NewsCategory>{news.category || '뉴스'}</NewsCategory>
              <NewsTitle>{news.title}</NewsTitle>
              <NewsFooter>
                <span>{news.provider}</span>
                <span>{new Date(news.pubDate).toLocaleDateString()}</span>
              </NewsFooter>
            </NewsCard>
          )) : <LoadingText>관련된 뉴스가 없습니다.</LoadingText>
        )}
      </NewsGrid>

    </Container>
  );
};

export default NewsPage;

// --- 스타일 정의 ---
const Container = styled.div` width: 100%; `;

// 키워드 박스 스타일
const KeywordSection = styled.div`
  background-color: ${props => props.theme.cardBg};
  padding: 20px;
  border-radius: 12px;
  border: 1px solid ${props => props.theme.border};
  margin-bottom: 30px;
`;

const KeywordHeader = styled.div`
  display: flex; align-items: center; gap: 10px; margin-bottom: 15px;
  h3 { font-size: 16px; font-weight: bold; color: ${props => props.theme.text}; }
`;

const InputBox = styled.div`
  display: flex; gap: 10px; margin-bottom: 15px;
  input {
    flex: 1; padding: 10px; border-radius: 8px; border: 1px solid ${props => props.theme.border};
    background: ${props => props.theme.bg}; color: ${props => props.theme.text};
    &:focus { outline: none; border-color: ${props => props.theme.active}; }
  }
  button {
    padding: 0 15px; border-radius: 8px; border: none; background: ${props => props.theme.active};
    cursor: pointer; display: flex; align-items: center; font-weight: bold;
  }
`;

const KeywordList = styled.div` display: flex; flex-wrap: wrap; gap: 10px; `;

const KeywordTag = styled.div`
  background-color: ${props => props.theme.active}20; /* 투명도 20% */
  color: ${props => props.theme.active};
  border: 1px solid ${props => props.theme.active};
  padding: 5px 10px; border-radius: 20px; font-size: 13px; font-weight: bold;
  display: flex; align-items: center; gap: 5px;
  
  span { cursor: pointer; display: flex; align-items: center; &:hover { color: red; } }
`;

const EmptyText = styled.span` font-size: 13px; color: ${props => props.theme.subText}; `;

// 카테고리 탭 스타일
const CategoryTabs = styled.div`
  display: flex; gap: 10px; margin-bottom: 20px; overflow-x: auto;
  padding-bottom: 5px; /* 스크롤바 여백 */
`;

const Tab = styled.button`
  background: none; border: none; font-size: 16px; font-weight: bold;
  color: ${props => props.$active ? props.theme.active : props.theme.subText};
  border-bottom: 2px solid ${props => props.$active ? props.theme.active : 'transparent'};
  padding: 8px 12px; cursor: pointer; white-space: nowrap;
  transition: 0.2s;
  &:hover { color: ${props => props.theme.text}; }
`;

// 뉴스 그리드 스타일
const NewsGrid = styled.div`
  display: grid; gap: 20px;
  grid-template-columns: repeat(1, 1fr);
  @media (min-width: 600px) { grid-template-columns: repeat(2, 1fr); }
  @media (min-width: 900px) { grid-template-columns: repeat(3, 1fr); }
  @media (min-width: 1200px) { grid-template-columns: repeat(4, 1fr); }
`;

const NewsCard = styled.div`
  background-color: ${props => props.theme.cardBg}; padding: 20px;
  border-radius: 12px; border: 1px solid ${props => props.theme.border};
  display: flex; flex-direction: column; min-height: 140px; cursor: pointer;
  transition: transform 0.2s;
  &:hover { transform: translateY(-5px); border-color: ${props => props.theme.active}; }
`;

const NewsCategory = styled.span`
  font-size: 12px; font-weight: bold; color: ${props => props.theme.active}; margin-bottom: 8px;
`;

const NewsTitle = styled.h4`
  font-size: 16px; font-weight: bold; color: ${props => props.theme.text}; margin-bottom: 15px;
  line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
`;

const NewsFooter = styled.div`
  margin-top: auto; display: flex; justify-content: space-between;
  font-size: 11px; color: ${props => props.theme.subText};
`;

const LoadingText = styled.div` width: 100%; text-align: center; padding: 40px; color: ${props => props.theme.subText}; `;