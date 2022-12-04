const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12 // for 分頁

const movies = [] //Array(80)'s data
let filteredMovies = [] //存放搜尋完的結果
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

//1. Movie List Content
function renderMovieList(data) {
  let rawHTML = ''
  data.forEach(item => { //為了遍歷data陣列的資料
    //需要title,image
    rawHTML += `
            <div class="col-sm-3">
                <div class="mb-2">
                    <div class="card" ">
                        <img src="${POSTER_URL + item.image}"
                        class="card-img-top" alt="Movie poster">
                        <div class="card-body">
                            <h5 class="card-title">${item.title}</h5>
                        </div>
                        <div class="card-footer">
                            <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                                data-bs-target="#movie-modal" data-id="${item.id}">More</button>
                            <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
                        </div>
                    </div>
                </div>
            </div>
`
  });

  dataPanel.innerHTML = rawHTML
}

// 2. Pagination
function renderPaginator(amount) {
  //要知道總共多個電影再去分配，假設總共80部，80除以12=6...8 --> 所以總共會有6+1=7頁 -->頁數要無條件進位 math.celi
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}" >${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

//page 1 -> movies 0-11 ; page 2 -> movies 12-23 ...
function getMoviesByPage(page) {

  //會分兩種：總共80筆電影要做分頁 movies ; 搜尋過後的電影要做分頁 filteredMovies
  const data = filteredMovies.length ? filteredMovies : movies

  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

//3. Modal
function showMovieModal(id) { //取得特定電影的id資訊
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  // 避免殘影
  modalTitle.innerText = ""
  modalDate.innerText = ""
  modalDescription.innerText = ""
  modalImage.src = ""

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
  })
}

//4. Favorite
function addToFavorite(id) {

  // function isMovieIdMatched(movie) {
  //   return movie.id === id
  // } 

  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  // const movie = movies.find(isMovieIdMatched) 跟上面的function配
  const movie = movies.find((movie) => movie.id === id) //箭頭函式

  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }

  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))// JSON.stringify(list):js資料變成json字串
}

//1-1. Movie list 的 event
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(event.target.dataset.id) //因為dataset取出來的id是字串，所以要轉成數字
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

//2-1. pagination's event
paginator.addEventListener('click', function onPaginatorlClicked(event) {
  if (event.target.tagName !== 'A') return //'A' = <a></a>

  const page = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(page))
})


//5. searchForm 
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault() //終止瀏覽器的預設行為，把控制權交給 JS
  // console.log(searchInput.value) //檢查是否按search後可以出現
  const keyword = searchInput.value.trim().toLowerCase() //移除空白; 變小寫，希望可以不分大小寫都可以搜到


  //如果輸入亂碼會直接變成空白
  // if (!keyword.length) {
  //   return alert('Please enter a valid string')
  // }

  filteredMovies = movies.filter(movie => movie.title.toLowerCase().includes(keyword)) //filter有符合條件就留著，沒有就丟掉(like過濾器)

  //輸入亂碼會判別，不會自動變成空白的
  if (filteredMovies.length === 0) {
    return alert('Cannot find movies with keyword:' + keyword)
  }

  //   for (const movie of movies) { //用迴圈迭代去檢查movie是否有含keyword，如果有就推進filteredMovies這個變數裡
  //   if(movie.title.toLowerCase().includes(keyword)){
  //     filteredMovies.push(movie) 
  //   }
  // }
  renderMovieList(getMoviesByPage(1)) //搜尋過後，預設顯示第 1 頁的畫面資料
  renderPaginator(filteredMovies.length) //搜尋過後，也要顯示分頁器，分頁器的長度是根據filteredmovie的長度而定
})

axios
  .get(INDEX_URL)
  .then((response) => {
    //  Array(80)
    movies.push(...response.data.results) //單純取Array(80)'s data的值
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(1))
    // for (const movie of response.data.results) { //方法二用for-of取陣列裡的值
    //   movies.push(movie) //一個個movie推進movies的陣列裡
    // }
  })




