// controllers/discussionsController.js
"use strict";

const Discussion = require("../models/Discussion"), // 사용자 모델 요청
  getDiscussionParams = (body, discussion) => {
    return {
      title: body.title,
      description: body.description,
      author: discussion,
      category: body.category,
      tags: body.tags,
    };
  };
  

module.exports = {
  /**
   * =====================================================================
   * C: CREATE / 생성
   * =====================================================================
   */
  // 1. new: 액션,
  new: (req, res) => {
    res.render("discussions/new");
  },
  // 2. create: 액션,
  create: (req, res, next) => {
    let discussionParams = getDiscussionParams(req.body, req.user);
    // 폼 파라미터로 사용자 생성
    Discussion.create(discussionParams)
      .then((discussion) => {
        res.locals.redirect = "/discussions";
        res.locals.discussion = discussion;
        next();
      })
      .catch((error) => {
        console.log(`Error saving discussion: ${error.message}`);
        next(error);
      });
  },
  // 3. redirectView: 액션,
  redirectView: (req, res, next) => {
    let redirectPath = res.locals.redirect;
    if (redirectPath) res.redirect(redirectPath);
    else next();
  },
  
  /**
   * =====================================================================
   * R: READ / 조회
   * =====================================================================
   */
  /**
   * ------------------------------------
   * ALL records / 모든 레코드
   * ------------------------------------
   */
  // 4. index: 액션,
  index: (req, res, next) => {
    Discussion.find().populate("author").exec()
      .then((discussions) => {
        // 사용자 배열로 index 페이지 렌더링
        res.locals.discussions = discussions; // 응답상에서 사용자 데이터를 저장하고 다음 미들웨어 함수 호출
        next();
      })
      .catch((error) => {
        // 로그 메시지를 출력하고 홈페이지로 리디렉션
        console.log(`Error fetching discussions: ${error.message}`);
        next(error); // 에러를 캐치하고 다음 미들웨어로 전달
      });
  },

  // 5. indexView: 엑션,
  indexView: (req, res) =>{
    res.render("discussions/index")
  },
  /**
   * ------------------------------------
   * SINGLE record / 단일 레코드
   * ------------------------------------
   */
  indexView: (req, res) => {
    res.render("discussions/index"); // 분리된 액션으로 뷰 렌더링
  },

  // 6. show: 액션,
  show: (req, res, next) => {
    let discussionId = req.params.id; // request params로부터 사용자 ID 수집
    Discussion.findById(discussionId).populate("author").populate("comments") // ID로 사용자 찾기
      .then((discussion) => {
        discussion.views++;
        discussion.save();
        res.locals.discussion = discussion; // 응답 객체를 통해 다음 믿들웨어 함수로 사용자 전달
        next();
      })
      .catch((error) => {
        console.log(`Error fetching discussion by ID: ${error.message}`);
        next(error); // 에러를 로깅하고 다음 함수로 전달
      });
  },

  // 7. showView: 액션,
  showView: (req, res) => { 
    res.render("discussions/show");
  },
  
  /**
   * =====================================================================
   * U: UPDATE / 수정
   * =====================================================================
   */
  // 8. edit: 액션,
  edit:(req, res, next)=>{
    let discussionId = req.params.id;
    Discussion.findById(discussionId).populate("author").populate("comments")
      .then((discussion)=>{
        res.render("discussions/edit", {
          discussion:discussion
        });
        next();
      })
      .catch((error) => {
        console.log(`Error fetching discussion by ID: ${error.message}`);
        next(error); // 에러를 로깅하고 다음 함수로 전달
      });
  },

  // 9. update: 액션,
  update: (req, res, next)=>{
    let discussionId = req.params.id;
    let discussionParams = getDiscussionParams(req.body);
    // 폼 파라미터로 사용자 생성
    Discussion.findByIdAndUpdate(discussionId,{
      $set: discussionParams
    })
      .populate("author")
      .then((discussion) => {
        res.locals.redirect = `/discussions/${discussionId}`;
        res.locals.discussion = discussion;
        next();
      })
      .catch((error) => {
        console.log(`Error updating discussion: ${error.message}`);
        next(error);
      });
  },
  
  /**
   * =====================================================================
   * D: DELETE / 삭제
   * =====================================================================
   */
  // 10. delete: 액션,
  delete: (req, res, next)=>{
    let discussionId = req.params.id;
    Discussion.findByIdAndRemove(discussionId)
      .then(()=>{
        res.locals.redirect = "/discussions";
        next();
      })
      .catch((error)=>{
        console.log(`Error: ${error.message}`);
        next(error);
      });
  }

};
