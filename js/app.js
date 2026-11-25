document.addEventListener('DOMContentLoaded', () => {
  const inputs = ['title', 'client', 'freelancer', 'amount', 'terms', 'contractDate', 'dueDate', 'taxType'];
  let currentDocType = 'contract';

  // 📅 기본 작성일자 설정 (오늘 날짜 기준)
  const todayDateObj = new Date();
  const yyyy = todayDateObj.getFullYear();
  const mm = String(todayDateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(todayDateObj.getDate()).padStart(2, '0');
  const todayFormattedStr = `${yyyy}-${mm}-${dd}`;

  const contractDateInput = document.getElementById('contractDate');
  if (contractDateInput && !contractDateInput.value) {
    contractDateInput.value = todayFormattedStr;
  }

  // 서식 탭 전환 이벤트
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      tabBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentDocType = e.target.getAttribute('data-type');
      updatePreview();
    });
  });

  // 세금 자동 계산 함수
  function calculateTax(amount, taxType) {
    const amountBox = document.getElementById('pv-amount-box');
    const paymentClause = document.getElementById('pv-payment-clause');
    
    if (!amount || amount <= 0) {
      amountBox.innerHTML = '<strong>0</strong> 원';
      if (paymentClause) paymentClause.textContent = '"갑"은 "을"이 작업을 완료하고 검수를 마친 후 7일 이내에 계약 금액을 전액 지급한다.';
      return;
    }

    const numAmount = Number(amount);
    let html = '';
    let clauseText = '';

    if (taxType === 'vat_exclude') {
      const vat = Math.round(numAmount * 0.1);
      const total = numAmount + vat;
      html = `<strong>${total.toLocaleString()}</strong> 원 (VAT 포함)<br>
              <div class="tax-detail">(공급가액: ${numAmount.toLocaleString()}원 / 부가가치세 10%: ${vat.toLocaleString()}원)</div>`;
      clauseText = `"갑"은 "을"이 작업을 완료하고 검수를 마친 후 7일 이내에 부가가치세가 포함된 총액 ${total.toLocaleString()}원을 지급한다.`;
    } 
    else if (taxType === 'vat_include') {
      const supply = Math.round(numAmount / 1.1);
      const vat = numAmount - supply;
      html = `<strong>${numAmount.toLocaleString()}</strong> 원 (VAT 포함)<br>
              <div class="tax-detail">(공급가액: ${supply.toLocaleString()}원 / 부가가치세: ${vat.toLocaleString()}원)</div>`;
      clauseText = `"갑"은 "을"이 작업을 완료하고 검수를 마친 후 7일 이내에 계약 금액 ${numAmount.toLocaleString()}원(VAT 포함)을 지급한다.`;
    } 
    else if (taxType === 'freelancer_33') {
      const tax33 = Math.floor(numAmount * 0.033);
      const netPay = numAmount - tax33;
      html = `<strong>${numAmount.toLocaleString()}</strong> 원 (총 금액)<br>
              <div class="tax-detail">(3.3% 원천징수 공제액: ${tax33.toLocaleString()}원 / <strong>실수령액: ${netPay.toLocaleString()}원</strong>)</div>`;
      clauseText = `"갑"은 "을"이 작업을 완료하고 검수를 마친 후 7일 이내에 3.3% 원천징수 세액을 공제한 실수령액 ${netPay.toLocaleString()}원을 지급한다.`;
    } 
    else {
      html = `<strong>${numAmount.toLocaleString()}</strong> 원`;
      clauseText = `"갑"은 "을"이 작업을 완료하고 검수를 마친 후 7일 이내에 계약 금액 ${numAmount.toLocaleString()}원을 전액 지급한다.`;
    }

    amountBox.innerHTML = html;
    if (paymentClause) paymentClause.textContent = clauseText;
  }

  // 실시간 미리보기 렌더링
  function updatePreview() {
    const clientVal = document.getElementById('client').value || '___';
    const freelancerVal = document.getElementById('freelancer').value || '___';

    const mainTitle = document.getElementById('doc-main-title');
    const intro = document.getElementById('pv-intro');
    const thAmount = document.getElementById('pv-th-amount');
    const thDueDate = document.getElementById('pv-th-dueDate');
    const h3Terms = document.getElementById('pv-h3-terms');
    const clauses = document.getElementById('contract-clauses');
    const sigContract = document.getElementById('sig-row-contract');
    const sigSingle = document.getElementById('sig-row-single');

    if (currentDocType === 'contract') {
      mainTitle.textContent = '간 이 용 역 계 약 서';
      intro.innerHTML = `발주자 <strong>${clientVal}</strong>(이하 "갑")과 수주자 <strong>${freelancerVal}</strong>(이하 "을")은 상호 신의성실의 원칙에 따라 아래와 같이 용역 계약을 체결한다.`;
      thAmount.textContent = '계약 금액';
      thDueDate.textContent = '완수 기한';
      h3Terms.textContent = '제 3 조 (특약 사항)';
      clauses.classList.remove('hidden');
      sigContract.classList.remove('hidden');
      sigSingle.classList.add('hidden');
    } 
    else if (currentDocType === 'estimate') {
      mainTitle.textContent = '견 적 서';
      intro.innerHTML = `수신: <strong>${clientVal}</strong> 귀하<br>아래와 같이 견적 금액을 제출합니다.`;
      thAmount.textContent = '견적 금액';
      thDueDate.textContent = '견적 유효일 / 완료일';
      h3Terms.textContent = '참고사항 및 안내';
      clauses.classList.add('hidden');
      sigContract.classList.add('hidden');
      sigSingle.classList.remove('hidden');
      document.getElementById('pv-single-name').textContent = freelancerVal;
    } 
    else if (currentDocType === 'invoice') {
      mainTitle.textContent = '청 구 서';
      intro.innerHTML = `수신: <strong>${clientVal}</strong> 귀하<br>아래와 같이 대금을 청구하오니 지정된 기일 내에 입금하여 주시기 바랍니다.`;
      thAmount.textContent = '청구 금액';
      thDueDate.textContent = '입금 마감일';
      h3Terms.textContent = '입금 계좌 및 안내';
      clauses.classList.add('hidden');
      sigContract.classList.add('hidden');
      sigSingle.classList.remove('hidden');
      document.getElementById('pv-single-name').textContent = freelancerVal;
    }

    // 값 렌더링
    inputs.forEach(id => {
      const val = document.getElementById(id).value;
      const target = document.getElementById(`pv-${id}`);
      if (!target) return;

      if (id === 'terms') {
        target.textContent = val || '등록된 내용이 없습니다.';
      } else if (id === 'contractDate') {
        if (val) {
          const d = new Date(val);
          target.textContent = `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
        } else {
          target.textContent = '____년 __월 __일';
        }
      } else {
        target.textContent = val || '___';
      }
    });

    calculateTax(document.getElementById('amount').value, document.getElementById('taxType').value);
    document.getElementById('pv-client-name').textContent = clientVal;
    document.getElementById('pv-freelancer-name').textContent = freelancerVal;
  }

  // 폼 입력 및 선택 변경 이벤트
  inputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', updatePreview);
      el.addEventListener('change', updatePreview);
    }
  });

  // ==========================================
  // ✍️ 양측 전자 서명 캔버스 로직
  // ==========================================
  function initSignatureCanvas(canvasId, clearBtnId, sigImgId, sigTextId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const clearBtn = document.getElementById(clearBtnId);
    const sigImg = document.getElementById(sigImgId);
    const sigImgSingle = document.getElementById('pv-sig-img-single');
    const sigText = document.getElementById(sigTextId);
    const sigTextSingle = document.getElementById('pv-sig-text-single');

    let isDrawing = false;
    let hasSigned = false;

    canvas.width = canvas.offsetWidth || 160;
    canvas.height = 90;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#000000';

    function getCoordinates(e) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      let clientX = e.clientX;
      let clientY = e.clientY;

      if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }

      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    }

    function startDrawing(e) {
      isDrawing = true;
      const pos = getCoordinates(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }

    function draw(e) {
      if (!isDrawing) return;
      const pos = getCoordinates(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      hasSigned = true;

      updatePreviewSig();
    }

    function stopDrawing() {
      if (isDrawing) {
        ctx.closePath();
        isDrawing = false;
      }
    }

    function updatePreviewSig() {
      if (hasSigned) {
        const dataURL = canvas.toDataURL('image/png');
        if (sigImg) {
          sigImg.src = dataURL;
          sigImg.classList.remove('hidden');
        }
        if (sigText) sigText.style.display = 'none';

        if (canvasId === 'sig-canvas-freelancer') {
          if (sigImgSingle) {
            sigImgSingle.src = dataURL;
            sigImgSingle.classList.remove('hidden');
          }
          if (sigTextSingle) sigTextSingle.style.display = 'none';
        }
      }
    }

    function clearCanvas() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      hasSigned = false;
      if (sigImg) {
        sigImg.src = '';
        sigImg.classList.add('hidden');
      }
      if (sigText) sigText.style.display = 'inline';

      if (canvasId === 'sig-canvas-freelancer') {
        if (sigImgSingle) {
          sigImgSingle.src = '';
          sigImgSingle.classList.add('hidden');
        }
        if (sigTextSingle) sigTextSingle.style.display = 'inline';
      }
    }

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startDrawing(e); });
    canvas.addEventListener('touchmove', (e) => { e.preventDefault(); draw(e); });
    canvas.addEventListener('touchend', stopDrawing);

    if (clearBtn) clearBtn.addEventListener('click', clearCanvas);
  }

  initSignatureCanvas('sig-canvas-client', 'clear-sig-client', 'pv-sig-img-client', 'pv-sig-text-client');
  initSignatureCanvas('sig-canvas-freelancer', 'clear-sig-freelancer', 'pv-sig-img-freelancer', 'pv-sig-text-freelancer');

  // ==========================================
  // 💾 [저장] / [불러오기] / [삭제] / [인쇄] 로직
  // ==========================================

  // 1. 💾 임시 저장
  document.getElementById('save-btn').addEventListener('click', () => {
    const data = { docType: currentDocType };
    inputs.forEach(id => data[id] = document.getElementById(id).value);
    localStorage.setItem('contract_data', JSON.stringify(data));
    alert('작성 중인 내용이 성공적으로 임시 저장되었습니다!');
  });

  // 2. 📂 불러오기 함수
  function loadSavedData(isManual = false) {
    const savedData = localStorage.getItem('contract_data');
    if (savedData) {
      const data = JSON.parse(savedData);
      if (data.docType) {
        currentDocType = data.docType;
        tabBtns.forEach(b => {
          b.classList.toggle('active', b.getAttribute('data-type') === currentDocType);
        });
      }
      inputs.forEach(id => {
        if (data[id]) document.getElementById(id).value = data[id];
      });
      updatePreview();
      if (isManual) alert('저장된 데이터를 성공적으로 불러왔습니다!');
    } else {
      if (isManual) alert('저장된 데이터가 없습니다.');
    }
  }

  document.getElementById('load-btn').addEventListener('click', () => {
    loadSavedData(true);
  });

  // 3. 🗑️ 삭제 (초기화)
  document.getElementById('reset-btn').addEventListener('click', () => {
    if (confirm('저장된 내용과 현재 작성 중인 데이터를 모두 삭제하시겠습니까?')) {
      localStorage.removeItem('contract_data');
      location.reload();
    }
  });

  // 4. 🖨️ PDF 다운로드 및 인쇄
  document.getElementById('print-btn').addEventListener('click', () => {
    window.print();
  });

  // 초기 렌더링 실행
  loadSavedData(false);
  updatePreview();
});