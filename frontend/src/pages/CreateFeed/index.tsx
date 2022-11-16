import React from 'react'
import './styles.scss'
import { ReactComponent as WarningIcon } from '@assets/warningIcon.svg'
import { ReactComponent as XIcon } from '@assets/XIcon.svg'
const CreateFeed = () => {
  return (
    <div className="createfeed-page">
      <div className="createfeed-header">피드 생성</div>
      <div className="createfeed-body">
        <div className="form-wrapper">
          <label className="form-label" htmlFor="feedName">
            제목
          </label>
          <input type="text" id="feedName" className="form-input" placeholder="피드의 제목을 입력해주세요" />
        </div>
        <div className="form-wrapper">
          <label className="form-label" htmlFor="feedDescribe">
            소개
          </label>
          <input type="text" id="feedDescribe" placeholder="피드의 소개를 입력해주세요" />
        </div>
        <div className="form-wrapper">
          <label className="form-label" htmlFor="dueDate"></label>
          <div className="form-warning">
            <WarningIcon />
            <span>한번 설정한 공개일은 추후에 바꿀 수 없습니다</span>
          </div>
          <input type="date" id="dueDate" placeholder="피드의 공개일을 설정해주세요" />
        </div>
        <div className="form-wrapper">
          <label className="form-label" htmlFor="userId">
            그룹원 추가
          </label>
          <input type="text" id="userId" placeholder="그룹원의 카카오 이메일을 입력해주세요" />
        </div>
        <div className="form-wrapper">
          <label className="form-label" htmlFor="userId">
            그룹원 목록
          </label>
          <span className="form-no-member">현재 추가된 그룹원이 없습니다</span>
          <div className="form-members-wrapper">
            <div className="form-member">
              <span>규현</span>
              <XIcon />
            </div>
          </div>
        </div>
      </div>
      <button className="button-large">피드 생성하기</button>
    </div>
  )
}

export default CreateFeed
