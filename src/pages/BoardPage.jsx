import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { UserContext } from '../context/UserContext';
import { FaPen, FaSearch } from "react-icons/fa";

const BoardPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("주식"); 
  const categories = ["주식", "정치", "맛집", "취미"];

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/board', {
          params: { category: category }
        });
        setPosts(res.data);
      } catch (err) {
        console.error("게시글 로딩 실패");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [category]);

  const handleWriteClick = () => {
    if (!user) {
      alert("로그인이 필요한 기능입니다.");
      navigate('/login');
      return;
    }
    navigate('/board/write');
  };

  return (
    <Container>
      <HeaderSection>
        <Title>📌 {category} 게시판</Title>
        <TabContainer>
          {categories.map((cat) => (
            <Tab 
              key={cat} 
              $active={category === cat} 
              onClick={() => setCategory(cat)}
            >
              {cat}
            </Tab>
          ))}
        </TabContainer>
      </HeaderSection>

      <Toolbar>
        <SearchBox>
          <FaSearch color="#888" />
          <input type="text" placeholder="관심있는 글 검색..." />
        </SearchBox>
        <WriteButton onClick={handleWriteClick}>
          <FaPen /> 글쓰기
        </WriteButton>
      </Toolbar>

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th width="5%">NO</th>
              <th width="55%">제목</th>
              <th width="15%">작성자</th>
              <th width="15%">날짜</th>
              <th width="10%">조회</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{textAlign:'center', padding: '30px'}}>로딩중...</td></tr>
            ) : posts.length > 0 ? (
              posts.map((post, index) => (
                <tr key={post.id} onClick={() => navigate(`/board/${post.id}`)}>
                  <td>{posts.length - index}</td>
                  <td className="title">{post.title}</td>
                  <td>{post.writerName}</td>
                  <td>
                    {/* ★ 여기가 수정된 부분! (날짜가 있으면 자르고, 없으면 '-' 표시) */}
                    {post.createdAt ? post.createdAt.split(" ")[0] : "-"}
                  </td>
                  <td>{post.viewCount}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" style={{textAlign:'center', padding: '30px'}}>게시글이 없습니다.</td></tr>
            )}
          </tbody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default BoardPage;

// --- 스타일 ---
const Container = styled.div` width: 100%; `;
const HeaderSection = styled.div` margin-bottom: 20px; border-bottom: 1px solid ${props => props.theme.border}; `;
const Title = styled.h2` font-size: 24px; font-weight: bold; color: ${props => props.theme.text}; margin-bottom: 15px; `;
const TabContainer = styled.div` display: flex; gap: 20px; `;
const Tab = styled.button` background: none; border: none; font-size: 16px; font-weight: bold; color: ${props => props.$active ? props.theme.active : props.theme.subText}; padding: 10px 5px; cursor: pointer; border-bottom: 3px solid ${props => props.$active ? props.theme.active : 'transparent'}; &:hover { color: ${props => props.theme.text}; } `;
const Toolbar = styled.div` display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding: 10px; background-color: ${props => props.theme.cardBg}; border: 1px solid ${props => props.theme.border}; border-radius: 8px; `;
const SearchBox = styled.div` display: flex; align-items: center; gap: 10px; background-color: ${props => props.theme.bg}; padding: 8px 12px; border-radius: 6px; border: 1px solid ${props => props.theme.border}; width: 300px; input { border: none; background: transparent; outline: none; width: 100%; color: ${props => props.theme.text}; } `;
const WriteButton = styled.button` background-color: ${props => props.theme.active}; color: #121212; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 5px; &:hover { opacity: 0.9; } `;
const TableContainer = styled.div` overflow-x: auto; border: 1px solid ${props => props.theme.border}; border-radius: 8px; background-color: ${props => props.theme.cardBg}; `;
const Table = styled.table` width: 100%; border-collapse: collapse; thead { background-color: ${props => props.theme.bg}; th { padding: 12px; text-align: left; font-size: 13px; color: ${props => props.theme.subText}; border-bottom: 1px solid ${props => props.theme.border}; } } tbody { tr { cursor: pointer; border-bottom: 1px solid ${props => props.theme.border}; transition: background 0.1s; &:hover { background-color: ${props => props.theme.hover}; } &:last-child { border-bottom: none; } } td { padding: 14px 12px; font-size: 14px; color: ${props => props.theme.text}; &.title { font-weight: bold; } } } `;