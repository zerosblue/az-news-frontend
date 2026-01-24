import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../api/axios';
import { UserContext } from '../context/UserContext';
import { FaTimes, FaCamera } from "react-icons/fa";

const BoardEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("주식");
  
  // 기존 이미지 (DB에서 불러온 것)
  const [existingImages, setExistingImages] = useState([]);
  
  // 새로 추가할 이미지 (파일)
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviewUrls, setNewPreviewUrls] = useState([]);

  // 데이터 불러오기
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`/api/board/${id}`);
        const { title, content, category, writerEmail, images } = res.data;
        
        if (user && writerEmail !== user.email) {
          alert("수정 권한이 없습니다.");
          navigate('/board');
          return;
        }
        
        setTitle(title);
        setContent(content);
        setCategory(category);
        setExistingImages(images); // 기존 이미지 세팅
      } catch (err) {
        alert("오류 발생");
        navigate('/board');
      }
    };
    if (user) fetchPost();
  }, [id, navigate, user]);

  // 기존 이미지 삭제 (즉시 서버에 요청)
  const handleDeleteExistingImage = async (imageId) => {
    if (!window.confirm("이 이미지를 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`/api/board/image/${imageId}`);
      // 화면에서도 제거
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
    } catch (err) {
      alert("이미지 삭제 실패");
    }
  };

  // 새 이미지 선택
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setNewFiles(prev => [...prev, ...files]); // 기존 선택에 추가

    const urls = files.map(file => URL.createObjectURL(file));
    setNewPreviewUrls(prev => [...prev, ...urls]);
  };

  // 새 이미지 선택 취소 (업로드 전)
  const handleRemoveNewFile = (index) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
    setNewPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  // 수정 완료 (PUT)
  const handleUpdate = async () => {
    const formData = new FormData();
    const boardData = { title, content, category };
    formData.append("data", new Blob([JSON.stringify(boardData)], { type: "application/json" }));

    // 새로 추가된 파일만 전송
    newFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      await axios.put(`/api/board/${id}`, formData);
      alert("수정되었습니다.");
      navigate(`/board/${id}`);
    } catch (err) {
      alert("수정 실패");
    }
  };

  return (
    <Container>
      <Title>✏️ 글 수정하기</Title>
      
      <Form>
        <Label>카테고리</Label>
        <Select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="주식">주식</option>
          <option value="정치">정치</option>
          <option value="맛집">맛집</option>
          <option value="취미">취미</option>
        </Select>

        <Label>제목</Label>
        <Input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />

        <Label>내용</Label>
        <Textarea value={content} onChange={(e) => setContent(e.target.value)} />

        <Label>사진 관리</Label>
        
        {/* 기존 이미지 리스트 */}
        <ImageGrid>
          {existingImages.map((img) => (
            <ImageBox key={img.id}>
              <img src={`http://localhost:8080${img.url}`} alt="기존" />
              <DeleteBadge onClick={() => handleDeleteExistingImage(img.id)}><FaTimes /></DeleteBadge>
            </ImageBox>
          ))}
          
          {/* 새 이미지 리스트 */}
          {newPreviewUrls.map((url, index) => (
            <ImageBox key={`new-${index}`}>
              <img src={url} alt="새 파일" style={{ opacity: 0.7 }} />
              <NewBadge>NEW</NewBadge>
              <DeleteBadge onClick={() => handleRemoveNewFile(index)}><FaTimes /></DeleteBadge>
            </ImageBox>
          ))}

          {/* 추가 버튼 */}
          <UploadLabel>
            <FaCamera size={24} />
            <input type="file" multiple accept="image/*" onChange={handleFileChange} hidden />
          </UploadLabel>
        </ImageGrid>

        <BtnGroup>
          <CancelBtn onClick={() => navigate(-1)}>취소</CancelBtn>
          <SubmitBtn onClick={handleUpdate}>수정 완료</SubmitBtn>
        </BtnGroup>
      </Form>
    </Container>
  );
};

export default BoardEditPage;

// --- 스타일 ---
const Container = styled.div` max-width: 800px; margin: 0 auto; padding: 20px; `;
const Title = styled.h2` margin-bottom: 20px; color: ${props => props.theme.text}; `;
const Form = styled.div` display: flex; flex-direction: column; gap: 15px; background: ${props => props.theme.cardBg}; padding: 30px; border-radius: 12px; border: 1px solid ${props => props.theme.border}; `;
const Label = styled.label` font-weight: bold; font-size: 14px; color: ${props => props.theme.subText}; `;
const Input = styled.input` padding: 12px; border-radius: 6px; border: 1px solid ${props => props.theme.border}; background: ${props => props.theme.bg}; color: ${props => props.theme.text}; `;
const Select = styled.select` padding: 12px; border-radius: 6px; border: 1px solid ${props => props.theme.border}; background: ${props => props.theme.bg}; color: ${props => props.theme.text}; width: 150px; `;
const Textarea = styled.textarea` height: 200px; padding: 12px; border-radius: 6px; border: 1px solid ${props => props.theme.border}; background: ${props => props.theme.bg}; color: ${props => props.theme.text}; resize: none; `;
const BtnGroup = styled.div` display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; `;
const SubmitBtn = styled.button` padding: 10px 20px; border-radius: 6px; border: none; font-weight: bold; cursor: pointer; background: ${props => props.theme.active}; color: #121212; `;
const CancelBtn = styled.button` padding: 10px 20px; border-radius: 6px; border: 1px solid ${props => props.theme.border}; background: transparent; color: ${props => props.theme.text}; cursor: pointer; `;

// 이미지 관리 스타일
const ImageGrid = styled.div` display: flex; gap: 10px; flex-wrap: wrap; `;
const ImageBox = styled.div` position: relative; width: 100px; height: 100px; border-radius: 8px; overflow: hidden; border: 1px solid ${props => props.theme.border}; img { width: 100%; height: 100%; object-fit: cover; } `;
const DeleteBadge = styled.div` position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,0.7); color: white; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 12px; &:hover { background: red; } `;
const NewBadge = styled.div` position: absolute; bottom: 0; left: 0; width: 100%; background: ${props => props.theme.active}; color: black; font-size: 10px; text-align: center; font-weight: bold; padding: 2px 0; `;
const UploadLabel = styled.label` width: 100px; height: 100px; border-radius: 8px; border: 2px dashed ${props => props.theme.border}; display: flex; align-items: center; justify-content: center; cursor: pointer; color: ${props => props.theme.subText}; &:hover { border-color: ${props => props.theme.active}; color: ${props => props.theme.active}; } `;