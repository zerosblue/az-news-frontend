import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { UserContext } from '../context/UserContext';

const BoardWritePage = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("주식");
  const [files, setFiles] = useState([]); 
  const [previewUrls, setPreviewUrls] = useState([]); 

  // 파일 선택
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);

    const urls = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  // 등록 버튼
  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return alert("제목과 내용을 입력해주세요.");

    const formData = new FormData();
    
    // 1. 글 내용 (JSON) -> Blob으로 감싸기 (스프링 규칙)
    const boardData = { title, content, category };
    formData.append("data", new Blob([JSON.stringify(boardData)], { type: "application/json" }));

    // 2. 파일들 담기
    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      // ★ 중요: headers 설정을 뺐음! (Axios가 알아서 boundary 설정함)
      await axios.post('/api/board', formData);
      
      alert("글이 등록되었습니다!");
      navigate('/board');
    } catch (err) {
      console.error(err);
      // 에러 메시지를 좀 더 자세히 보기 위해 수정
      const errMsg = err.response?.data?.message || err.response?.data || "서버 오류 발생";
      alert(`글 등록 실패: ${errMsg}`);
    }
  };

  return (
    <Container>
      <Title>✏️ 글 쓰기</Title>
      
      <Form>
        <Label>카테고리</Label>
        <Select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="주식">주식</option>
          <option value="정치">정치</option>
          <option value="맛집">맛집</option>
          <option value="취미">취미</option>
        </Select>

        <Label>제목</Label>
        <Input 
          type="text" placeholder="제목을 입력하세요" 
          value={title} onChange={(e) => setTitle(e.target.value)} 
        />

        <Label>내용</Label>
        <Textarea 
          placeholder="내용을 자유롭게 적어주세요..." 
          value={content} onChange={(e) => setContent(e.target.value)} 
        />

        <Label>사진 첨부 (선택)</Label>
        <Input type="file" multiple accept="image/*" onChange={handleFileChange} />

        {/* 미리보기 영역 */}
        {previewUrls.length > 0 && (
          <PreviewContainer>
            {previewUrls.map((url, index) => (
              <PreviewImage key={index} src={url} alt="미리보기" />
            ))}
          </PreviewContainer>
        )}

        <BtnGroup>
          <CancelBtn onClick={() => navigate(-1)}>취소</CancelBtn>
          <SubmitBtn onClick={handleSubmit}>등록하기</SubmitBtn>
        </BtnGroup>
      </Form>
    </Container>
  );
};

export default BoardWritePage;

// --- 스타일 (그대로 유지) ---
const Container = styled.div` max-width: 800px; margin: 0 auto; padding: 20px; `;
const Title = styled.h2` margin-bottom: 20px; color: ${props => props.theme.text}; `;
const Form = styled.div` 
  display: flex; flex-direction: column; gap: 15px; 
  background: ${props => props.theme.cardBg}; padding: 30px; border-radius: 12px;
  border: 1px solid ${props => props.theme.border};
`;
const Label = styled.label` font-weight: bold; font-size: 14px; color: ${props => props.theme.subText}; `;
const Input = styled.input`
  padding: 12px; border-radius: 6px; border: 1px solid ${props => props.theme.border};
  background: ${props => props.theme.bg}; color: ${props => props.theme.text};
`;
const Select = styled.select`
  padding: 12px; border-radius: 6px; border: 1px solid ${props => props.theme.border};
  background: ${props => props.theme.bg}; color: ${props => props.theme.text}; width: 150px;
`;
const Textarea = styled.textarea`
  height: 200px; padding: 12px; border-radius: 6px; border: 1px solid ${props => props.theme.border};
  background: ${props => props.theme.bg}; color: ${props => props.theme.text}; resize: none;
`;
const BtnGroup = styled.div` display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; `;
const SubmitBtn = styled.button`
  padding: 10px 20px; border-radius: 6px; border: none; font-weight: bold; cursor: pointer;
  background: ${props => props.theme.active}; color: #121212;
`;
const CancelBtn = styled.button`
  padding: 10px 20px; border-radius: 6px; border: 1px solid ${props => props.theme.border};
  background: transparent; color: ${props => props.theme.text}; cursor: pointer;
`;
const PreviewContainer = styled.div`
  display: flex; gap: 10px; overflow-x: auto; padding: 10px 0;
`;
const PreviewImage = styled.img`
  width: 100px; height: 100px; object-fit: cover; border-radius: 8px;
  border: 1px solid ${props => props.theme.border};
`;