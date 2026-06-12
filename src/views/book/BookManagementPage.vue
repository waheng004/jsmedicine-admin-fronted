<template>
  <section class="resource-page book-page">
    <div class="resource-header">
      <div>
        <h2>图书管理</h2>
        <p>图书列表、分类管理、章节配置和考卷配置统一收口在当前页面，章节不再拆分独立左侧菜单。</p>
      </div>
      <div class="header-actions">
        <button
          type="button"
          class="ghost-button"
          :class="{ 'book-page__tab-button--active': activeTab === 'books' }"
          @click="switchTab('books')"
        >
          图书列表
        </button>
        <button
          type="button"
          class="ghost-button"
          :class="{ 'book-page__tab-button--active': activeTab === 'categories' }"
          @click="switchTab('categories')"
        >
          分类管理
        </button>
        <button v-if="activeTab === 'books' && canCreateBook" class="primary-button" type="button" @click="openCreateBook">
          新增图书
        </button>
        <button
          v-if="activeTab === 'categories' && canManageCategories"
          class="primary-button"
          type="button"
          @click="openCreateCategory"
        >
          新增分类
        </button>
        <button class="ghost-button" type="button" @click="refreshCurrentTab">刷新</button>
      </div>
    </div>

    <form v-if="activeTab === 'books'" class="filter-bar" @submit.prevent="handleBookSearch">
      <label>
        <span>图书搜索</span>
        <input v-model.trim="bookQuery.keyword" placeholder="按图书名搜索" />
      </label>
      <label>
        <span>图书分类</span>
        <select v-model="bookQuery.categoryId">
          <option value="">全部分类</option>
          <option v-for="item in categoryOptions" :key="item.value" :value="item.value">
            {{ item.label }}
          </option>
        </select>
      </label>
      <label>
        <span>审核状态</span>
        <select v-model="bookQuery.reviewStatus">
          <option value="">全部状态</option>
          <option v-for="option in reviewStatusOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </label>
      <button class="primary-button" type="submit">查询</button>
      <button class="ghost-button" type="button" @click="resetBookSearch">重置</button>
    </form>

    <form v-else class="filter-bar" @submit.prevent="handleCategorySearch">
      <label>
        <span>分类搜索</span>
        <input v-model.trim="categoryQuery.keyword" placeholder="按分类名称搜索" />
      </label>
      <button class="primary-button" type="submit">查询</button>
      <button class="ghost-button" type="button" @click="resetCategorySearch">重置</button>
    </form>

    <p v-if="message.text" class="page-message" :class="{ 'page-message--error': message.type === 'error' }">
      {{ message.text }}
    </p>

    <div v-if="activeTab === 'books'" class="table-wrap">
      <table class="data-table book-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>图书名</th>
            <th>图书分类</th>
            <th>总页数</th>
            <th>封面</th>
            <th>考卷配置</th>
            <th>审核状态</th>
            <th>发布状态</th>
            <th>更新时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="bookLoading">
            <td colspan="10">加载中...</td>
          </tr>
          <tr v-else-if="books.length === 0">
            <td colspan="10">暂无数据</td>
          </tr>
          <tr v-for="book in books" v-else :key="book.id">
            <td>{{ book.id }}</td>
            <td class="book-table__name">
              <strong>{{ book.bookName || '-' }}</strong>
              <span>{{ book.author || '未填写作者' }}</span>
            </td>
            <td>{{ resolveCategoryName(book.categoryId) }}</td>
            <td>{{ formatText(book.totalPages) }}</td>
            <td>
              <div v-if="resolveBookCover(book)" class="image-cell">
                <img class="image-thumb image-thumb--book" :src="resolveBookCover(book)" alt="图书封面" />
                <a class="image-link" :href="resolveBookCover(book)" target="_blank" rel="noreferrer">查看原图</a>
              </div>
              <span v-else>-</span>
            </td>
            <td>{{ resolvePaperName(book.paperId, book.paperTitle) }}</td>
            <td>{{ reviewStatusMap[String(book.reviewStatus ?? '')] || '-' }}</td>
            <td>{{ publishStatusMap[String(book.publishStatus ?? '')] || '-' }}</td>
            <td>{{ formatDateTime(book.updatedAt || book.publishedAt) }}</td>
            <td class="row-actions">
              <button type="button" @click="openBookDetail(book)">查看</button>
              <button v-if="canEditBook" type="button" @click="openEditBook(book)">修改</button>
              <button v-if="canManageChapters" type="button" @click="openChapterManager(book)">图书章节</button>
              <button v-if="canEditBook" type="button" @click="openConfigureBookPaper(book)">考卷配置</button>
              <button v-if="canReviewBook" type="button" @click="openReviewBook(book)">审核</button>
              <button v-if="canDeleteBook" class="danger-link" type="button" @click="deleteBook(book)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="table-wrap">
      <table class="data-table category-table">
        <thead>
          <tr>
            <th>分类名称</th>
            <th>创建时间</th>
            <th>更新时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="categoryLoading">
            <td colspan="4">加载中...</td>
          </tr>
          <tr v-else-if="categories.length === 0">
            <td colspan="4">暂无数据</td>
          </tr>
          <tr v-for="category in categories" v-else :key="category.id">
            <td>{{ category.categoryName || '-' }}</td>
            <td>{{ formatDateTime(category.createdAt) }}</td>
            <td>{{ formatDateTime(category.updatedAt) }}</td>
            <td class="row-actions">
              <button type="button" @click="openCategoryDetail(category)">查看</button>
              <button v-if="canManageCategories" type="button" @click="openEditCategory(category)">修改</button>
              <button v-if="canDeleteCategories" class="danger-link" type="button" @click="deleteCategory(category)">
                删除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer class="pagination-bar">
      <span>共 {{ activeTab === 'books' ? bookTotal : categoryTotal }} 条</span>
      <button type="button" :disabled="currentPage <= 1" @click="changePage(currentPage - 1)">上一页</button>
      <span>第 {{ currentPage }} 页</span>
      <button type="button" :disabled="currentRecords.length < currentSize" @click="changePage(currentPage + 1)">
        下一页
      </button>
    </footer>

    <div v-if="bookDialog.open" class="modal-backdrop" @click.self="closeBookDialog">
      <section class="modal book-modal">
        <header>
          <h3>{{ bookDialog.title }}</h3>
          <button type="button" aria-label="关闭" @click="closeBookDialog">x</button>
        </header>

        <dl v-if="bookDialog.mode === 'detail'" class="detail-list">
          <template v-for="item in bookDetailEntries" :key="item.label">
            <dt>{{ item.label }}</dt>
            <dd>
              <template v-if="item.type === 'image'">
                <div v-if="item.value" class="detail-media">
                  <img class="detail-media__preview" :src="item.value" :alt="`${item.label}预览`" />
                  <a class="detail-media__link" :href="item.value" target="_blank" rel="noreferrer">{{ item.value }}</a>
                </div>
                <span v-else>-</span>
              </template>
              <template v-else>{{ item.value }}</template>
            </dd>
          </template>
        </dl>

        <form v-else class="edit-form" @submit.prevent="submitBookDialog">
          <label v-if="bookDialog.mode !== 'review'" class="edit-form__full">
            <span>图书分类</span>
            <select v-model="bookDialog.form.categoryId" required>
              <option value="">请选择分类</option>
              <option v-for="item in categoryOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </option>
            </select>
          </label>
          <label v-if="bookDialog.mode !== 'review'">
            <span>图书名称</span>
            <input v-model.trim="bookDialog.form.bookName" required maxlength="128" />
          </label>
          <label v-if="bookDialog.mode !== 'review'">
            <span>作者</span>
            <input v-model.trim="bookDialog.form.author" maxlength="64" />
          </label>
          <label v-if="bookDialog.mode !== 'review'">
            <span>出版社</span>
            <input v-model.trim="bookDialog.form.publisher" maxlength="64" />
          </label>
          <label v-if="bookDialog.mode !== 'review'">
            <span>总页数</span>
            <input v-model="bookDialog.form.totalPages" type="number" min="0" />
          </label>
          <label v-if="bookDialog.mode !== 'review'">
            <span>发布状态</span>
            <select v-model="bookDialog.form.publishStatus">
              <option v-for="option in publishStatusOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </label>
          <label v-if="bookDialog.mode !== 'review'">
            <span>排序</span>
            <input v-model="bookDialog.form.sortOrder" type="number" min="0" />
          </label>
          <label v-if="bookDialog.mode !== 'review'">
            <span>发布时间</span>
            <input v-model="bookDialog.form.publishedAt" type="datetime-local" />
          </label>
          <label v-if="bookDialog.mode === 'review'">
            <span>审核状态</span>
            <select v-model="bookDialog.form.reviewStatus" required>
              <option v-for="option in reviewStatusOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </label>
          <label v-if="bookDialog.mode === 'paper'">
            <span>图书考卷</span>
            <select v-model="bookDialog.form.paperId">
              <option value="">不配置考卷</option>
              <option v-for="option in examPaperOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </label>
          <label v-if="bookDialog.mode === 'review'" class="edit-form__full">
            <span>审核意见</span>
            <textarea v-model.trim="bookDialog.form.comment" placeholder="请输入审核意见" />
          </label>
          <label v-if="bookDialog.mode !== 'review'" class="edit-form__full">
            <span>图书封面</span>
            <div class="cover-upload-field">
              <div class="cover-upload-field__preview">
                <img
                  v-if="bookDialog.form.coverUrl"
                  class="image-thumb image-thumb--book"
                  :src="resolvePublicFileUrl(bookDialog.form.coverUrl)"
                  alt="图书封面预览"
                />
                <span v-else>未上传封面</span>
              </div>
              <div class="cover-upload-field__actions">
                <input
                  id="book-cover-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  @change="handleBookCoverChange"
                />
                <button class="ghost-button" type="button" :disabled="bookDialog.uploading" @click="triggerBookCoverInput">
                  {{ bookDialog.uploading ? '上传中...' : '上传封面' }}
                </button>
                <span v-if="bookDialog.form.coverUrl" class="cover-upload-field__path">{{ bookDialog.form.coverUrl }}</span>
              </div>
            </div>
          </label>
          <label v-if="bookDialog.mode !== 'review'" class="edit-form__full">
            <span>简介</span>
            <textarea v-model.trim="bookDialog.form.introduction" placeholder="请输入图书简介" />
          </label>

          <div class="modal-actions">
            <button class="ghost-button" type="button" @click="closeBookDialog">取消</button>
            <button class="primary-button" type="submit" :disabled="bookDialog.submitting">
              {{ bookDialog.submitting ? '提交中...' : '提交' }}
            </button>
          </div>
        </form>
      </section>
    </div>

    <div v-if="categoryDialog.open" class="modal-backdrop" @click.self="closeCategoryDialog">
      <section class="modal category-modal">
        <header>
          <h3>{{ categoryDialog.title }}</h3>
          <button type="button" aria-label="关闭" @click="closeCategoryDialog">x</button>
        </header>

        <div v-if="categoryDialog.loading" class="category-modal__loading">加载中...</div>

        <template v-else-if="categoryDialog.mode === 'detail'">
          <dl class="detail-list">
            <dt>ID</dt>
            <dd>{{ formatText(categoryDialog.record?.id) }}</dd>
            <dt>分类名称</dt>
            <dd>{{ formatText(categoryDialog.record?.categoryName) }}</dd>
            <dt>排序</dt>
            <dd>{{ formatText(categoryDialog.record?.sortOrder ?? 0) }}</dd>
            <dt>状态</dt>
            <dd>{{ commonStatusMap[String(categoryDialog.record?.status ?? '')] || '-' }}</dd>
            <dt>创建时间</dt>
            <dd>{{ formatDateTime(categoryDialog.record?.createdAt) }}</dd>
            <dt>更新时间</dt>
            <dd>{{ formatDateTime(categoryDialog.record?.updatedAt) }}</dd>
          </dl>
        </template>

        <template v-else>
          <form class="edit-form" @submit.prevent="submitCategoryDialog">
            <label class="edit-form__full">
              <span>分类名称</span>
              <input v-model.trim="categoryDialog.form.categoryName" required maxlength="64" />
            </label>
            <label>
              <span>排序</span>
              <input v-model="categoryDialog.form.sortOrder" type="number" min="0" />
            </label>
            <label>
              <span>状态</span>
              <select v-model="categoryDialog.form.status">
                <option v-for="option in commonStatusOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </label>

            <div class="modal-actions">
              <button class="ghost-button" type="button" @click="closeCategoryDialog">取消</button>
              <button class="primary-button" type="submit" :disabled="categoryDialog.submitting">
                {{ categoryDialog.submitting ? '提交中...' : '提交' }}
              </button>
            </div>
          </form>

          <section v-if="categoryDialog.record?.id" class="category-linking">
            <div class="category-linking__section">
              <div class="category-linking__header">
                <div>
                  <h4>当前分类图书</h4>
                  <p>可搜索当前分类下的图书，并批量移出该分类。</p>
                </div>
                <button
                  class="ghost-button"
                  type="button"
                  :disabled="categoryBinding.loading || !categoryBinding.selectedIds.length"
                  @click="removeSelectedBooksFromCategory"
                >
                  移出分类
                </button>
              </div>

              <form class="filter-bar category-linking__filter" @submit.prevent="searchCategoryBindingBooks">
                <label>
                  <span>图书名</span>
                  <input v-model.trim="categoryBinding.keyword" placeholder="请输入图书名" />
                </label>
                <button class="primary-button" type="submit">查询</button>
                <button class="ghost-button" type="button" @click="resetCategoryBindingBooks">重置</button>
              </form>

              <div class="table-wrap">
                <table class="data-table category-linking__table">
                  <thead>
                    <tr>
                      <th>选择</th>
                      <th>图书名</th>
                      <th>作者</th>
                      <th>封面</th>
                      <th>审核状态</th>
                      <th>发布状态</th>
                      <th>更新时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="categoryBinding.loading">
                      <td colspan="7">加载中...</td>
                    </tr>
                    <tr v-else-if="categoryBinding.records.length === 0">
                      <td colspan="7">当前分类下暂无图书</td>
                    </tr>
                    <tr v-for="item in categoryBinding.records" v-else :key="item.id">
                      <td>
                        <input v-model="categoryBinding.selectedIds" type="checkbox" :value="item.id" />
                      </td>
                      <td>{{ item.bookName || '-' }}</td>
                      <td>{{ item.author || '-' }}</td>
                      <td class="table-cell--image">
                        <div v-if="item.coverUrl" class="image-cell">
                          <img class="image-thumb" :src="resolvePublicFileUrl(item.coverUrl)" alt="图书封面" />
                        </div>
                        <span v-else>-</span>
                      </td>
                      <td>{{ reviewStatusMap[String(item.reviewStatus ?? '')] || '-' }}</td>
                      <td>{{ publishStatusMap[String(item.publishStatus ?? '')] || '-' }}</td>
                      <td>{{ formatDateTime(item.updatedAt) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <footer class="pagination-bar category-linking__pagination">
                <span>共 {{ categoryBinding.total }} 条</span>
                <button
                  type="button"
                  :disabled="categoryBinding.page <= 1"
                  @click="changeCategoryBindingPage(categoryBinding.page - 1)"
                >
                  上一页
                </button>
                <span>第 {{ categoryBinding.page }} 页</span>
                <button
                  type="button"
                  :disabled="categoryBinding.records.length < categoryBinding.size"
                  @click="changeCategoryBindingPage(categoryBinding.page + 1)"
                >
                  下一页
                </button>
              </footer>
            </div>

            <div class="category-linking__section">
              <div class="category-linking__header">
                <div>
                  <h4>加入图书到当前分类</h4>
                  <p>搜索全量图书后加入当前分类。单分类模型下，加入后会覆盖图书原有分类。</p>
                </div>
                <button
                  class="primary-button"
                  type="button"
                  :disabled="categoryCandidate.loading || !categoryCandidate.selectedIds.length"
                  @click="addSelectedBooksToCategory"
                >
                  加入当前分类
                </button>
              </div>

              <form class="filter-bar category-linking__filter" @submit.prevent="searchCategoryCandidateBooks">
                <label>
                  <span>图书名</span>
                  <input v-model.trim="categoryCandidate.keyword" placeholder="请输入图书名" />
                </label>
                <button class="primary-button" type="submit">查询</button>
                <button class="ghost-button" type="button" @click="resetCategoryCandidateBooks">重置</button>
              </form>

              <div class="table-wrap">
                <table class="data-table category-linking__table">
                  <thead>
                    <tr>
                      <th>选择</th>
                      <th>图书名</th>
                      <th>当前分类</th>
                      <th>作者</th>
                      <th>审核状态</th>
                      <th>发布状态</th>
                      <th>更新时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="categoryCandidate.loading">
                      <td colspan="7">加载中...</td>
                    </tr>
                    <tr v-else-if="categoryCandidate.records.length === 0">
                      <td colspan="7">暂无可加入图书</td>
                    </tr>
                    <tr v-for="item in categoryCandidate.records" v-else :key="item.id">
                      <td>
                        <input
                          v-model="categoryCandidate.selectedIds"
                          type="checkbox"
                          :value="item.id"
                          :disabled="String(item.categoryId ?? '') === String(categoryDialog.record?.id ?? '')"
                        />
                      </td>
                      <td>{{ item.bookName || '-' }}</td>
                      <td>{{ resolveCategoryName(item.categoryId) }}</td>
                      <td>{{ item.author || '-' }}</td>
                      <td>{{ reviewStatusMap[String(item.reviewStatus ?? '')] || '-' }}</td>
                      <td>{{ publishStatusMap[String(item.publishStatus ?? '')] || '-' }}</td>
                      <td>{{ formatDateTime(item.updatedAt) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <footer class="pagination-bar category-linking__pagination">
                <span>共 {{ categoryCandidate.total }} 条</span>
                <button
                  type="button"
                  :disabled="categoryCandidate.page <= 1"
                  @click="changeCategoryCandidatePage(categoryCandidate.page - 1)"
                >
                  上一页
                </button>
                <span>第 {{ categoryCandidate.page }} 页</span>
                <button
                  type="button"
                  :disabled="categoryCandidate.records.length < categoryCandidate.size"
                  @click="changeCategoryCandidatePage(categoryCandidate.page + 1)"
                >
                  下一页
                </button>
              </footer>
            </div>
          </section>
        </template>
      </section>
    </div>

    <div v-if="chapterDialog.open" class="modal-backdrop" @click.self="closeChapterDialog">
      <section class="modal chapter-modal">
        <header>
          <h3>{{ chapterDialog.book?.bookName || '图书' }} - 图书章节</h3>
          <button type="button" aria-label="关闭" @click="closeChapterDialog">x</button>
        </header>

        <div class="chapter-modal__body">
          <div class="chapter-modal__toolbar">
            <p>只展示标题、起始页、张数和创建时间，章节考卷配置在行内完成。</p>
            <button v-if="canManageChapters" class="primary-button" type="button" @click="openCreateChapter">
              新增章节
            </button>
          </div>

          <p
            v-if="chapterDialog.message.text"
            class="page-message"
            :class="{ 'page-message--error': chapterDialog.message.type === 'error' }"
          >
            {{ chapterDialog.message.text }}
          </p>

          <div class="table-wrap">
            <table class="data-table chapter-table">
              <thead>
                <tr>
                  <th>标题</th>
                  <th>起始页</th>
                  <th>张数</th>
                  <th>创建时间</th>
                  <th>考卷配置</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="chapterDialog.loading">
                  <td colspan="6">加载中...</td>
                </tr>
                <tr v-else-if="chapterDialog.records.length === 0">
                  <td colspan="6">暂无数据</td>
                </tr>
                <tr v-for="chapter in chapterDialog.records" v-else :key="chapter.id">
                  <td class="chapter-table__title">
                    <span class="chapter-table__indent" :style="{ width: `${resolveChapterIndent(chapter)}px` }" />
                    <strong>{{ chapter.chapterTitle || '-' }}</strong>
                  </td>
                  <td>{{ formatText(chapter.startPage) }}</td>
                  <td>{{ formatText(chapter.pageCount) }}</td>
                  <td>{{ formatDateTime(chapter.createdAt) }}</td>
                  <td>{{ resolvePaperName(chapter.paperId, chapter.paperTitle) }}</td>
                  <td class="row-actions">
                    <button type="button" @click="openChapterDetail(chapter)">查看</button>
                    <button v-if="canManageChapters" type="button" @click="openEditChapter(chapter)">修改</button>
                    <button v-if="canManageChapters" type="button" @click="openConfigureChapterPaper(chapter)">考卷配置</button>
                    <button v-if="canDeleteChapters" class="danger-link" type="button" @click="deleteChapter(chapter)">
                      删除
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <footer class="pagination-bar chapter-modal__pagination">
            <span>共 {{ chapterDialog.total }} 条</span>
            <button type="button" :disabled="chapterDialog.page <= 1" @click="changeChapterPage(chapterDialog.page - 1)">
              上一页
            </button>
            <span>第 {{ chapterDialog.page }} 页</span>
            <button
              type="button"
              :disabled="chapterDialog.records.length < chapterDialog.size"
              @click="changeChapterPage(chapterDialog.page + 1)"
            >
              下一页
            </button>
          </footer>
        </div>
      </section>
    </div>

    <div v-if="chapterEntryDialog.open" class="modal-backdrop modal-backdrop--stacked" @click.self="closeChapterEntryDialog">
      <section class="modal chapter-entry-modal">
        <header>
          <h3>{{ chapterEntryDialog.title }}</h3>
          <button type="button" aria-label="关闭" @click="closeChapterEntryDialog">x</button>
        </header>

        <dl v-if="chapterEntryDialog.mode === 'detail'" class="detail-list">
          <dt>ID</dt>
          <dd>{{ formatText(chapterEntryDialog.record?.id) }}</dd>
          <dt>标题</dt>
          <dd>{{ formatText(chapterEntryDialog.record?.chapterTitle) }}</dd>
          <dt>起始页</dt>
          <dd>{{ formatText(chapterEntryDialog.record?.startPage) }}</dd>
          <dt>张数</dt>
          <dd>{{ formatText(chapterEntryDialog.record?.pageCount) }}</dd>
          <dt>创建时间</dt>
          <dd>{{ formatDateTime(chapterEntryDialog.record?.createdAt) }}</dd>
          <dt>考卷配置</dt>
          <dd>{{ resolvePaperName(chapterEntryDialog.record?.paperId, chapterEntryDialog.record?.paperTitle) }}</dd>
        </dl>

        <form v-else class="edit-form" @submit.prevent="submitChapterEntryDialog">
          <label class="edit-form__full">
            <span>章节标题</span>
            <input v-model.trim="chapterEntryDialog.form.chapterTitle" required maxlength="128" />
          </label>
          <label>
            <span>父级章节</span>
            <select v-model="chapterEntryDialog.form.parentId">
              <option value="">顶级章节</option>
              <option v-for="option in chapterParentOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </label>
          <label>
            <span>起始页</span>
            <input v-model="chapterEntryDialog.form.startPage" type="number" min="1" />
          </label>
          <label>
            <span>张数</span>
            <input v-model="chapterEntryDialog.form.pageCount" type="number" min="0" />
          </label>
          <label>
            <span>排序</span>
            <input v-model="chapterEntryDialog.form.sortOrder" type="number" min="0" />
          </label>
          <label>
            <span>状态</span>
            <select v-model="chapterEntryDialog.form.status">
              <option v-for="option in commonStatusOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </label>
          <label v-if="chapterEntryDialog.mode === 'paper'" class="edit-form__full">
            <span>章节考卷</span>
            <select v-model="chapterEntryDialog.form.paperId">
              <option value="">不配置考卷</option>
              <option v-for="option in examPaperOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </label>
          <label v-if="chapterEntryDialog.mode !== 'paper'" class="edit-form__full">
            <span>章节内容</span>
            <textarea v-model.trim="chapterEntryDialog.form.content" placeholder="请输入章节内容" />
          </label>

          <div class="modal-actions">
            <button class="ghost-button" type="button" @click="closeChapterEntryDialog">取消</button>
            <button class="primary-button" type="submit" :disabled="chapterEntryDialog.submitting">
              {{ chapterEntryDialog.submitting ? '提交中...' : '提交' }}
            </button>
          </div>
        </form>
      </section>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCurrentAdmin } from '../../api/auth'
import { uploadCoverFile } from '../../api/content-files'
import { bodyRequest, pageRequest, request, resolvePublicFileUrl } from '../../api/http'
import { getAdminInfo } from '../../utils/auth'

const route = useRoute()
const router = useRouter()

const reviewStatusOptions = [
  { label: '草稿', value: '0' },
  { label: '待审核', value: '1' },
  { label: '已通过', value: '2' },
  { label: '已拒绝', value: '3' },
]

const publishStatusOptions = [
  { label: '未发布', value: '0' },
  { label: '已发布', value: '1' },
]

const commonStatusOptions = [
  { label: '未启用', value: '0' },
  { label: '启用', value: '1' },
]

const reviewStatusMap = Object.fromEntries(reviewStatusOptions.map((item) => [item.value, item.label]))
const publishStatusMap = Object.fromEntries(publishStatusOptions.map((item) => [item.value, item.label]))
const commonStatusMap = Object.fromEntries(commonStatusOptions.map((item) => [item.value, item.label]))

const permissionRules = {
  createBook: {
    anyOf: ['admin:learning:book:create', 'learning:book:create', 'book:create'],
    keywordGroups: [
      ['book', 'create'],
      ['learning', 'book', 'create'],
    ],
  },
  editBook: {
    anyOf: ['admin:learning:book:update', 'learning:book:update', 'book:update', 'book:edit'],
    keywordGroups: [
      ['book', 'update'],
      ['book', 'edit'],
    ],
  },
  deleteBook: {
    anyOf: ['admin:learning:book:delete', 'learning:book:delete', 'book:delete'],
    keywordGroups: [['book', 'delete']],
  },
  reviewBook: {
    anyOf: ['admin:learning:book:review', 'learning:book:review', 'book:review'],
    keywordGroups: [
      ['book', 'review'],
      ['book', 'audit'],
    ],
  },
  manageCategories: {
    anyOf: [
      'admin:learning:book-category:create',
      'admin:learning:book-category:update',
      'admin:learning:book-category:bind',
      'admin:learning:book-categories:create',
      'admin:learning:book-categories:update',
      'admin:learning:book-categories:bind',
      'admin:learning:book-categories:assign',
      'admin:learning:book-categories:remove',
      'learning:book-category:create',
      'learning:book-category:update',
      'learning:book-category:bind',
      'learning:book-categories:create',
      'learning:book-categories:update',
      'learning:book-categories:bind',
      'learning:book-categories:assign',
      'learning:book-categories:remove',
      'book-category:create',
      'book-category:update',
      'book-category:bind',
      'book-categories:create',
      'book-categories:update',
      'book-categories:bind',
      'book-categories:assign',
      'book-categories:remove',
    ],
    keywordGroups: [
      ['book', 'category', 'create'],
      ['book', 'category', 'update'],
      ['book', 'category', 'bind'],
      ['books', 'category', 'create'],
      ['books', 'category', 'update'],
      ['books', 'category', 'bind'],
      ['books', 'category', 'assign'],
      ['books', 'category', 'remove'],
      ['book', 'categories', 'create'],
      ['book', 'categories', 'update'],
      ['book', 'categories', 'bind'],
      ['book', 'categories', 'assign'],
      ['book', 'categories', 'remove'],
    ],
  },
  deleteCategories: {
    anyOf: [
      'admin:learning:book-category:delete',
      'admin:learning:book-categories:delete',
      'learning:book-category:delete',
      'learning:book-categories:delete',
      'book-category:delete',
      'book-categories:delete',
    ],
    keywordGroups: [
      ['book', 'category', 'delete'],
      ['books', 'category', 'delete'],
      ['book', 'categories', 'delete'],
    ],
  },
  manageChapters: {
    anyOf: [
      'admin:learning:book-chapter:create',
      'admin:learning:book-chapter:update',
      'learning:book-chapter:create',
      'learning:book-chapter:update',
      'book-chapter:create',
      'book-chapter:update',
      'book:update',
    ],
    keywordGroups: [
      ['book', 'chapter', 'create'],
      ['book', 'chapter', 'update'],
      ['book', 'update'],
    ],
  },
  deleteChapters: {
    anyOf: ['admin:learning:book-chapter:delete', 'learning:book-chapter:delete', 'book-chapter:delete'],
    keywordGroups: [['book', 'chapter', 'delete']],
  },
}

const activeTab = ref(route.path === '/books/categories' ? 'categories' : 'books')
const message = reactive({
  text: '',
  type: 'info',
})

const bookQuery = reactive({
  page: 1,
  size: 10,
  keyword: '',
  categoryId: '',
  reviewStatus: '',
})

const categoryQuery = reactive({
  page: 1,
  size: 10,
  keyword: '',
})

const books = ref([])
const bookTotal = ref(0)
const bookLoading = ref(false)

const categories = ref([])
const categoryTotal = ref(0)
const categoryLoading = ref(false)
const categoryOptions = ref([])
const categoryLookup = ref({})

const chapterTreeLookup = ref({})
const examPaperOptions = ref([])
const adminPermissions = ref(normalizePermissions(getAdminInfo()?.permissions))

const bookDialog = reactive({
  open: false,
  mode: 'detail',
  title: '',
  record: null,
  form: createBookForm(),
  submitting: false,
  uploading: false,
})

const categoryDialog = reactive({
  open: false,
  mode: 'detail',
  title: '',
  record: null,
  form: createCategoryForm(),
  submitting: false,
  loading: false,
})

const categoryBinding = reactive({
  keyword: '',
  page: 1,
  size: 8,
  total: 0,
  loading: false,
  records: [],
  selectedIds: [],
})

const categoryCandidate = reactive({
  keyword: '',
  page: 1,
  size: 8,
  total: 0,
  loading: false,
  records: [],
  selectedIds: [],
})

const chapterDialog = reactive({
  open: false,
  book: null,
  loading: false,
  records: [],
  total: 0,
  page: 1,
  size: 10,
  message: {
    text: '',
    type: 'info',
  },
})

const chapterEntryDialog = reactive({
  open: false,
  mode: 'detail',
  title: '',
  record: null,
  form: createChapterForm(),
  submitting: false,
})

const canCreateBook = computed(() => hasPermission(permissionRules.createBook))
const canEditBook = computed(() => hasPermission(permissionRules.editBook))
const canDeleteBook = computed(() => hasPermission(permissionRules.deleteBook))
const canReviewBook = computed(() => hasPermission(permissionRules.reviewBook))
const canManageCategories = computed(() => hasPermission(permissionRules.manageCategories))
const canDeleteCategories = computed(() => hasPermission(permissionRules.deleteCategories))
const canManageChapters = computed(() => hasPermission(permissionRules.manageChapters))
const canDeleteChapters = computed(() => hasPermission(permissionRules.deleteChapters))

const currentPage = computed(() => (activeTab.value === 'books' ? bookQuery.page : categoryQuery.page))
const currentSize = computed(() => (activeTab.value === 'books' ? bookQuery.size : categoryQuery.size))
const currentRecords = computed(() => (activeTab.value === 'books' ? books.value : categories.value))

const bookDetailEntries = computed(() => {
  if (!bookDialog.record) return []

  return [
    { label: 'ID', value: formatText(bookDialog.record.id) },
    { label: '图书名称', value: formatText(bookDialog.record.bookName) },
    { label: '作者', value: formatText(bookDialog.record.author) },
    { label: '出版社', value: formatText(bookDialog.record.publisher) },
    { label: '图书分类', value: resolveCategoryName(bookDialog.record.categoryId) },
    { label: '总页数', value: formatText(bookDialog.record.totalPages) },
    { label: '图书封面', value: resolveBookCover(bookDialog.record), type: 'image' },
    { label: '图书考卷', value: resolvePaperName(bookDialog.record.paperId, bookDialog.record.paperTitle) },
    { label: '审核状态', value: reviewStatusMap[String(bookDialog.record.reviewStatus ?? '')] || '-' },
    { label: '发布状态', value: publishStatusMap[String(bookDialog.record.publishStatus ?? '')] || '-' },
    { label: '发布时间', value: formatDateTime(bookDialog.record.publishedAt) },
    { label: '简介', value: formatText(bookDialog.record.introduction) },
  ]
})

const chapterParentOptions = computed(() =>
  chapterDialog.records
    .filter((item) => String(item.id) !== String(chapterEntryDialog.record?.id || ''))
    .map((item) => ({
      label: `${'·'.repeat(resolveChapterLevel(item))} ${item.chapterTitle || `章节 #${item.id}`}`.trim(),
      value: String(item.id),
    })),
)

function normalizePermissions(permissions) {
  if (!Array.isArray(permissions)) return []
  return permissions.map((item) => String(item || '').trim().toLowerCase()).filter(Boolean)
}

function hasPermission(rule) {
  const permissions = adminPermissions.value
  if (!permissions.length) return true
  if (
    permissions.includes('*') ||
    permissions.includes('all') ||
    permissions.includes('*:*') ||
    permissions.includes('admin:*') ||
    permissions.includes('super:*')
  ) {
    return true
  }

  const anyOf = (rule?.anyOf || []).map((item) => item.toLowerCase())
  if (anyOf.some((item) => permissions.includes(item))) {
    return true
  }

  return (rule?.keywordGroups || []).some((keywords) =>
    permissions.some((permission) => keywords.every((keyword) => permission.includes(keyword.toLowerCase()))),
  )
}

function showMessage(text, type = 'info') {
  message.text = text
  message.type = type
}

function showChapterMessage(text, type = 'info') {
  chapterDialog.message.text = text
  chapterDialog.message.type = type
}

function createBookForm(record = null) {
  return {
    categoryId: record?.categoryId === null || record?.categoryId === undefined ? '' : String(record.categoryId),
    bookName: record?.bookName || '',
    author: record?.author || '',
    publisher: record?.publisher || '',
    coverUrl: record?.coverUrl || '',
    introduction: record?.introduction || '',
    totalPages: record?.totalPages ?? 0,
    paperId: record?.paperId === null || record?.paperId === undefined ? '' : String(record.paperId),
    sortOrder: record?.sortOrder ?? 0,
    reviewStatus: String(record?.reviewStatus ?? '2'),
    publishStatus: String(record?.publishStatus ?? '0'),
    publishedAt: toDateTimeLocalValue(record?.publishedAt),
    comment: '',
  }
}

function createCategoryForm(record = null) {
  return {
    categoryName: record?.categoryName || '',
    sortOrder: record?.sortOrder ?? 0,
    status: String(record?.status ?? '1'),
  }
}

function createChapterForm(record = null) {
  return {
    parentId: record?.parentId === null || record?.parentId === undefined ? '' : String(record.parentId),
    chapterTitle: record?.chapterTitle || '',
    content: record?.content || '',
    startPage: record?.startPage ?? '',
    pageCount: record?.pageCount ?? 0,
    paperId: record?.paperId === null || record?.paperId === undefined ? '' : String(record.paperId),
    sortOrder: record?.sortOrder ?? 0,
    status: String(record?.status ?? '1'),
  }
}

function formatText(value) {
  if (value === null || value === undefined || value === '') return '-'
  return String(value)
}

function formatDateTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString('zh-CN', { hour12: false })
}

function toDateTimeLocalValue(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function toApiDateTime(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

function optionalNumber(value) {
  if (value === '' || value === null || value === undefined) return null
  const numeric = Number(value)
  return Number.isNaN(numeric) ? null : numeric
}

function switchTab(tab) {
  activeTab.value = tab
  router.replace(tab === 'categories' ? '/books/categories' : '/books')
  showMessage('')
}

watch(
  () => route.path,
  (path) => {
    activeTab.value = path === '/books/categories' ? 'categories' : 'books'
    if (activeTab.value === 'categories') {
      loadCategories()
      return
    }
    loadBooks()
  },
)

function resolveBookCover(book) {
  return book?.coverUrl ? resolvePublicFileUrl(book.coverUrl) : ''
}

function resolveCategoryName(categoryId) {
  if (categoryId === null || categoryId === undefined || categoryId === '') return '未分类'
  return categoryLookup.value[String(categoryId)] || `分类 #${categoryId}`
}

function resolvePaperName(paperId, paperTitle = '') {
  if (paperTitle) return paperTitle
  if (paperId === null || paperId === undefined || paperId === '') return '未配置'
  const option = examPaperOptions.value.find((item) => String(item.value) === String(paperId))
  return option?.label || `考卷 #${paperId}`
}

function buildChapterTreeLookup(records) {
  const lookup = {}
  records.forEach((item) => {
    lookup[String(item.id)] = item
  })
  chapterTreeLookup.value = lookup
}

function resolveChapterLevel(chapter) {
  let level = 0
  let currentParentId = chapter?.parentId
  let guard = 0

  while (currentParentId && guard < 20) {
    const parent = chapterTreeLookup.value[String(currentParentId)]
    if (!parent) break
    level += 1
    currentParentId = parent.parentId
    guard += 1
  }

  return level
}

function resolveChapterIndent(chapter) {
  return resolveChapterLevel(chapter) * 18
}

function resetCategoryBindingState() {
  categoryBinding.keyword = ''
  categoryBinding.page = 1
  categoryBinding.total = 0
  categoryBinding.records = []
  categoryBinding.selectedIds = []
}

function resetCategoryCandidateState() {
  categoryCandidate.keyword = ''
  categoryCandidate.page = 1
  categoryCandidate.total = 0
  categoryCandidate.records = []
  categoryCandidate.selectedIds = []
}

async function refreshAdminPermissions() {
  try {
    const result = await getCurrentAdmin()
    adminPermissions.value = normalizePermissions(result?.data?.permissions)
  } catch {}
}

async function loadCategoryOptions() {
  try {
    const result = await pageRequest('/api/v1/admin/learning/book-categories', {
      page: 1,
      size: 100,
    })
    const records = Array.isArray(result?.data?.records) ? result.data.records : []
    categoryOptions.value = records.map((item) => ({
      label: item.categoryName || `分类 #${item.id}`,
      value: String(item.id),
    }))
    categoryLookup.value = Object.fromEntries(
      records.map((item) => [String(item.id), item.categoryName || `分类 #${item.id}`]),
    )
  } catch {}
}

async function loadExamPaperOptions() {
  try {
    const result = await pageRequest('/api/v1/admin/learning/exam-papers', {
      page: 1,
      size: 100,
    })
    const records = Array.isArray(result?.data?.records) ? result.data.records : []
    examPaperOptions.value = records.map((item) => ({
      label: `${item.paperName || '未命名考卷'} (#${item.id})`,
      value: String(item.id),
    }))
  } catch {}
}

async function loadBooks() {
  bookLoading.value = true
  showMessage('')

  try {
    const result = await pageRequest('/api/v1/admin/learning/books', {
      page: bookQuery.page,
      size: bookQuery.size,
      keyword: bookQuery.keyword,
      categoryId: optionalNumber(bookQuery.categoryId),
      reviewStatus: bookQuery.reviewStatus,
    })
    const data = result?.data || {}
    books.value = Array.isArray(data.records) ? data.records : []
    bookTotal.value = Number(data.total || books.value.length || 0)
  } catch (error) {
    books.value = []
    bookTotal.value = 0
    showMessage(error.message || '图书列表加载失败', 'error')
  } finally {
    bookLoading.value = false
  }
}

async function loadCategories() {
  categoryLoading.value = true
  showMessage('')

  try {
    const result = await pageRequest('/api/v1/admin/learning/book-categories', {
      page: categoryQuery.page,
      size: categoryQuery.size,
      keyword: categoryQuery.keyword,
    })
    const data = result?.data || {}
    categories.value = Array.isArray(data.records) ? data.records : []
    categoryTotal.value = Number(data.total || categories.value.length || 0)
  } catch (error) {
    categories.value = []
    categoryTotal.value = 0
    showMessage(error.message || '图书分类加载失败', 'error')
  } finally {
    categoryLoading.value = false
  }
}

async function refreshCurrentTab() {
  if (activeTab.value === 'books') {
    await Promise.all([loadBooks(), loadCategoryOptions(), loadExamPaperOptions()])
  } else {
    await Promise.all([loadCategories(), loadCategoryOptions()])
  }
}

function handleBookSearch() {
  bookQuery.page = 1
  loadBooks()
}

function resetBookSearch() {
  bookQuery.keyword = ''
  bookQuery.categoryId = ''
  bookQuery.reviewStatus = ''
  bookQuery.page = 1
  loadBooks()
}

function handleCategorySearch() {
  categoryQuery.page = 1
  loadCategories()
}

function resetCategorySearch() {
  categoryQuery.keyword = ''
  categoryQuery.page = 1
  loadCategories()
}

function changePage(page) {
  if (activeTab.value === 'books') {
    bookQuery.page = page
    loadBooks()
    return
  }

  categoryQuery.page = page
  loadCategories()
}

async function fetchBookDetail(book) {
  const result = await request(`/api/v1/admin/learning/books/${encodeURIComponent(book.id)}`)
  return result?.data ? { ...book, ...result.data } : { ...book }
}

async function fetchCategoryDetail(categoryId) {
  const result = await request(`/api/v1/admin/learning/book-categories/${encodeURIComponent(categoryId)}`)
  return result?.data || null
}

async function loadCategoryBindingBooks() {
  if (!categoryDialog.record?.id) return

  categoryBinding.loading = true
  categoryBinding.selectedIds = []

  try {
    const result = await pageRequest(
      `/api/v1/admin/learning/book-categories/${encodeURIComponent(categoryDialog.record.id)}/books`,
      {
        page: categoryBinding.page,
        size: categoryBinding.size,
        keyword: categoryBinding.keyword,
      },
    )
    const data = result?.data || {}
    categoryBinding.records = Array.isArray(data.records) ? data.records : []
    categoryBinding.total = Number(data.total || categoryBinding.records.length || 0)
  } catch (error) {
    categoryBinding.records = []
    categoryBinding.total = 0
    showMessage(error.message || '分类下图书加载失败', 'error')
  } finally {
    categoryBinding.loading = false
  }
}

async function loadCategoryCandidateBooks() {
  if (!categoryDialog.record?.id) return

  categoryCandidate.loading = true
  categoryCandidate.selectedIds = []

  try {
    const result = await pageRequest('/api/v1/admin/learning/books', {
      page: categoryCandidate.page,
      size: categoryCandidate.size,
      keyword: categoryCandidate.keyword,
    })
    const data = result?.data || {}
    categoryCandidate.records = Array.isArray(data.records) ? data.records : []
    categoryCandidate.total = Number(data.total || categoryCandidate.records.length || 0)
  } catch (error) {
    categoryCandidate.records = []
    categoryCandidate.total = 0
    showMessage(error.message || '可选图书加载失败', 'error')
  } finally {
    categoryCandidate.loading = false
  }
}

async function refreshCategoryRelations() {
  await Promise.all([
    loadCategoryBindingBooks(),
    loadCategoryCandidateBooks(),
    loadCategories(),
    loadCategoryOptions(),
    loadBooks(),
  ])
  if (categoryDialog.record?.id) {
    categoryDialog.record = await fetchCategoryDetail(categoryDialog.record.id)
    categoryDialog.form = createCategoryForm(categoryDialog.record)
  }
}

function searchCategoryBindingBooks() {
  categoryBinding.page = 1
  loadCategoryBindingBooks()
}

function resetCategoryBindingBooks() {
  categoryBinding.keyword = ''
  categoryBinding.page = 1
  loadCategoryBindingBooks()
}

function changeCategoryBindingPage(page) {
  categoryBinding.page = page
  loadCategoryBindingBooks()
}

function searchCategoryCandidateBooks() {
  categoryCandidate.page = 1
  loadCategoryCandidateBooks()
}

function resetCategoryCandidateBooks() {
  categoryCandidate.keyword = ''
  categoryCandidate.page = 1
  loadCategoryCandidateBooks()
}

function changeCategoryCandidatePage(page) {
  categoryCandidate.page = page
  loadCategoryCandidateBooks()
}

async function addSelectedBooksToCategory() {
  if (!categoryDialog.record?.id || !categoryCandidate.selectedIds.length) {
    showMessage('请先选择要加入分类的图书', 'error')
    return
  }

  try {
    await bodyRequest(
      `/api/v1/admin/learning/book-categories/${encodeURIComponent(categoryDialog.record.id)}/books`,
      'POST',
      {
        bookIds: categoryCandidate.selectedIds.map((item) => Number(item)),
      },
    )
    showMessage('图书加入分类成功')
    await refreshCategoryRelations()
  } catch (error) {
    showMessage(error.message || '图书加入分类失败', 'error')
  }
}

async function removeSelectedBooksFromCategory() {
  if (!categoryDialog.record?.id || !categoryBinding.selectedIds.length) {
    showMessage('请先选择要移出分类的图书', 'error')
    return
  }

  try {
    await request(`/api/v1/admin/learning/book-categories/${encodeURIComponent(categoryDialog.record.id)}/books`, {
      method: 'DELETE',
      body: JSON.stringify({
        bookIds: categoryBinding.selectedIds.map((item) => Number(item)),
      }),
    })
    showMessage('图书移出分类成功')
    await refreshCategoryRelations()
  } catch (error) {
    showMessage(error.message || '图书移出分类失败', 'error')
  }
}

function openCreateBook() {
  bookDialog.open = true
  bookDialog.mode = 'create'
  bookDialog.title = '新增图书'
  bookDialog.record = null
  bookDialog.form = createBookForm()
}

async function openBookDetail(book) {
  try {
    bookDialog.record = await fetchBookDetail(book)
  } catch {
    bookDialog.record = { ...book }
  }

  bookDialog.open = true
  bookDialog.mode = 'detail'
  bookDialog.title = '图书详情'
}

async function openEditBook(book) {
  try {
    bookDialog.record = await fetchBookDetail(book)
  } catch (error) {
    showMessage(error.message || '图书详情加载失败', 'error')
    return
  }

  bookDialog.open = true
  bookDialog.mode = 'edit'
  bookDialog.title = '修改图书'
  bookDialog.form = createBookForm(bookDialog.record)
}

async function openReviewBook(book) {
  try {
    bookDialog.record = await fetchBookDetail(book)
  } catch (error) {
    showMessage(error.message || '图书详情加载失败', 'error')
    return
  }

  bookDialog.open = true
  bookDialog.mode = 'review'
  bookDialog.title = '图书审核'
  bookDialog.form = createBookForm(bookDialog.record)
}

async function openConfigureBookPaper(book) {
  try {
    bookDialog.record = await fetchBookDetail(book)
  } catch (error) {
    showMessage(error.message || '图书详情加载失败', 'error')
    return
  }

  await loadExamPaperOptions()
  bookDialog.open = true
  bookDialog.mode = 'paper'
  bookDialog.title = '图书考卷配置'
  bookDialog.form = createBookForm(bookDialog.record)
}

function closeBookDialog() {
  bookDialog.open = false
  bookDialog.mode = 'detail'
  bookDialog.title = ''
  bookDialog.record = null
  bookDialog.form = createBookForm()
  bookDialog.submitting = false
  bookDialog.uploading = false
}

function buildBookPayload(form, source = null) {
  return {
    categoryId: optionalNumber(form.categoryId),
    bookName: form.bookName || source?.bookName || '',
    author: form.author || source?.author || '',
    publisher: form.publisher || source?.publisher || '',
    coverUrl: form.coverUrl || source?.coverUrl || '',
    introduction: form.introduction || source?.introduction || '',
    totalPages: optionalNumber(form.totalPages) ?? optionalNumber(source?.totalPages) ?? 0,
    paperId: optionalNumber(form.paperId),
    sortOrder: optionalNumber(form.sortOrder) ?? optionalNumber(source?.sortOrder) ?? 0,
    reviewStatus: String(source?.reviewStatus ?? '0'),
    publishStatus: String(form.publishStatus ?? source?.publishStatus ?? '0'),
    publishedAt: toApiDateTime(form.publishedAt),
  }
}

async function submitBookDialog() {
  bookDialog.submitting = true

  try {
    if (bookDialog.mode === 'create') {
      await bodyRequest('/api/v1/admin/learning/books', 'POST', buildBookPayload(bookDialog.form))
    } else if (bookDialog.mode === 'edit' || bookDialog.mode === 'paper') {
      await bodyRequest(
        `/api/v1/admin/learning/books/${encodeURIComponent(bookDialog.record.id)}`,
        'PUT',
        buildBookPayload(bookDialog.form, bookDialog.record),
      )
    } else if (bookDialog.mode === 'review') {
      await bodyRequest(`/api/v1/admin/learning/books/${encodeURIComponent(bookDialog.record.id)}/review`, 'PATCH', {
        reviewStatus: String(bookDialog.form.reviewStatus || '2'),
        comment: bookDialog.form.comment || '',
      })
    }

    showMessage('操作成功')
    closeBookDialog()
    await Promise.all([loadBooks(), loadCategoryOptions()])
  } catch (error) {
    showMessage(error.message || '操作失败', 'error')
  } finally {
    bookDialog.submitting = false
  }
}

function triggerBookCoverInput() {
  document.getElementById('book-cover-upload')?.click()
}

async function handleBookCoverChange(event) {
  const file = event.target?.files?.[0]
  if (!file) return

  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    showMessage('仅支持 jpg、png、webp 格式封面', 'error')
    event.target.value = ''
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    showMessage('封面大小不能超过 5MB', 'error')
    event.target.value = ''
    return
  }

  try {
    bookDialog.uploading = true
    const result = await uploadCoverFile(file, 'book-cover')
    bookDialog.form.coverUrl = result.coverUrl || ''
    showMessage('封面上传成功')
  } catch (error) {
    showMessage(error.message || '封面上传失败', 'error')
  } finally {
    bookDialog.uploading = false
    event.target.value = ''
  }
}

async function deleteBook(book) {
  if (!window.confirm(`确认删除图书《${book.bookName || book.id}》吗？`)) {
    return
  }

  try {
    await request(`/api/v1/admin/learning/books/${encodeURIComponent(book.id)}`, { method: 'DELETE' })
    showMessage('删除成功')
    loadBooks()
  } catch (error) {
    showMessage(error.message || '删除失败', 'error')
  }
}

function openCreateCategory() {
  resetCategoryBindingState()
  resetCategoryCandidateState()
  categoryDialog.open = true
  categoryDialog.mode = 'create'
  categoryDialog.title = '新增图书分类'
  categoryDialog.record = null
  categoryDialog.form = createCategoryForm()
}

async function openCategoryDetail(category) {
  categoryDialog.loading = true
  categoryDialog.open = true
  categoryDialog.mode = 'detail'
  categoryDialog.title = '图书分类详情'

  try {
    categoryDialog.record = await fetchCategoryDetail(category.id)
  } catch (error) {
    categoryDialog.record = { ...category }
    showMessage(error.message || '分类详情加载失败', 'error')
  } finally {
    categoryDialog.loading = false
  }
}

async function openEditCategory(category) {
  categoryDialog.loading = true
  categoryDialog.open = true
  categoryDialog.mode = 'edit'
  categoryDialog.title = '修改图书分类'
  resetCategoryBindingState()
  resetCategoryCandidateState()

  try {
    categoryDialog.record = await fetchCategoryDetail(category.id)
    categoryDialog.form = createCategoryForm(categoryDialog.record)
    await Promise.all([loadCategoryBindingBooks(), loadCategoryCandidateBooks()])
  } catch (error) {
    categoryDialog.record = { ...category }
    categoryDialog.form = createCategoryForm(category)
    showMessage(error.message || '分类详情加载失败', 'error')
  } finally {
    categoryDialog.loading = false
  }
}

function closeCategoryDialog() {
  categoryDialog.open = false
  categoryDialog.mode = 'detail'
  categoryDialog.title = ''
  categoryDialog.record = null
  categoryDialog.form = createCategoryForm()
  categoryDialog.submitting = false
  categoryDialog.loading = false
  resetCategoryBindingState()
  resetCategoryCandidateState()
}

function buildCategoryPayload(form, source = null) {
  return {
    parentId: optionalNumber(source?.parentId),
    categoryName: form.categoryName || '',
    sortOrder: optionalNumber(form.sortOrder) ?? 0,
    status: String(form.status || '1'),
  }
}

async function submitCategoryDialog() {
  categoryDialog.submitting = true

  try {
    if (categoryDialog.mode === 'create') {
      await bodyRequest('/api/v1/admin/learning/book-categories', 'POST', buildCategoryPayload(categoryDialog.form))
    } else {
      await bodyRequest(
        `/api/v1/admin/learning/book-categories/${encodeURIComponent(categoryDialog.record.id)}`,
        'PUT',
        buildCategoryPayload(categoryDialog.form, categoryDialog.record),
      )
    }

    showMessage('操作成功')
    closeCategoryDialog()
    await Promise.all([loadCategories(), loadCategoryOptions()])
  } catch (error) {
    showMessage(error.message || '操作失败', 'error')
  } finally {
    categoryDialog.submitting = false
  }
}

async function deleteCategory(category) {
  if (!window.confirm(`确认删除分类《${category.categoryName || category.id}》吗？`)) {
    return
  }

  try {
    await request(`/api/v1/admin/learning/book-categories/${encodeURIComponent(category.id)}`, { method: 'DELETE' })
    showMessage('删除成功')
    await Promise.all([loadCategories(), loadCategoryOptions()])
  } catch (error) {
    showMessage(error.message || '删除失败', 'error')
  }
}

async function loadChapters() {
  if (!chapterDialog.book?.id) return

  chapterDialog.loading = true
  showChapterMessage('')

  try {
    const result = await pageRequest(`/api/v1/admin/learning/books/${encodeURIComponent(chapterDialog.book.id)}/chapters`, {
      page: chapterDialog.page,
      size: chapterDialog.size,
    })
    const data = result?.data || {}
    chapterDialog.records = Array.isArray(data.records) ? data.records : []
    chapterDialog.total = Number(data.total || chapterDialog.records.length || 0)
    buildChapterTreeLookup(chapterDialog.records)
  } catch (error) {
    chapterDialog.records = []
    chapterDialog.total = 0
    showChapterMessage(error.message || '图书章节加载失败', 'error')
  } finally {
    chapterDialog.loading = false
  }
}

async function openChapterManager(book) {
  chapterDialog.open = true
  chapterDialog.book = book
  chapterDialog.page = 1
  chapterDialog.message.text = ''
  await Promise.all([loadChapters(), loadExamPaperOptions()])
}

function closeChapterDialog() {
  chapterDialog.open = false
  chapterDialog.book = null
  chapterDialog.loading = false
  chapterDialog.records = []
  chapterDialog.total = 0
  chapterDialog.page = 1
  chapterDialog.message.text = ''
  chapterTreeLookup.value = {}
  closeChapterEntryDialog()
}

function changeChapterPage(page) {
  chapterDialog.page = page
  loadChapters()
}

function openCreateChapter() {
  chapterEntryDialog.open = true
  chapterEntryDialog.mode = 'create'
  chapterEntryDialog.title = '新增图书章节'
  chapterEntryDialog.record = null
  chapterEntryDialog.form = createChapterForm()
}

function openChapterDetail(chapter) {
  chapterEntryDialog.open = true
  chapterEntryDialog.mode = 'detail'
  chapterEntryDialog.title = '图书章节详情'
  chapterEntryDialog.record = { ...chapter }
}

function openEditChapter(chapter) {
  chapterEntryDialog.open = true
  chapterEntryDialog.mode = 'edit'
  chapterEntryDialog.title = '修改图书章节'
  chapterEntryDialog.record = { ...chapter }
  chapterEntryDialog.form = createChapterForm(chapter)
}

async function openConfigureChapterPaper(chapter) {
  await loadExamPaperOptions()
  chapterEntryDialog.open = true
  chapterEntryDialog.mode = 'paper'
  chapterEntryDialog.title = '章节考卷配置'
  chapterEntryDialog.record = { ...chapter }
  chapterEntryDialog.form = createChapterForm(chapter)
}

function closeChapterEntryDialog() {
  chapterEntryDialog.open = false
  chapterEntryDialog.mode = 'detail'
  chapterEntryDialog.title = ''
  chapterEntryDialog.record = null
  chapterEntryDialog.form = createChapterForm()
  chapterEntryDialog.submitting = false
}

function buildChapterPayload(form, source = null) {
  return {
    bookId: optionalNumber(chapterDialog.book?.id),
    parentId: optionalNumber(form.parentId),
    chapterTitle: form.chapterTitle || source?.chapterTitle || '',
    content: form.content || source?.content || '',
    startPage: optionalNumber(form.startPage),
    pageCount: optionalNumber(form.pageCount) ?? optionalNumber(source?.pageCount) ?? 0,
    paperId: optionalNumber(form.paperId),
    sortOrder: optionalNumber(form.sortOrder) ?? optionalNumber(source?.sortOrder) ?? 0,
    status: String(form.status || source?.status || '1'),
  }
}

async function submitChapterEntryDialog() {
  chapterEntryDialog.submitting = true

  try {
    if (chapterEntryDialog.mode === 'create') {
      await bodyRequest('/api/v1/admin/learning/books/chapters', 'POST', buildChapterPayload(chapterEntryDialog.form))
    } else {
      await bodyRequest(
        `/api/v1/admin/learning/books/chapters/${encodeURIComponent(chapterEntryDialog.record.id)}`,
        'PUT',
        buildChapterPayload(chapterEntryDialog.form, chapterEntryDialog.record),
      )
    }

    showChapterMessage('操作成功')
    closeChapterEntryDialog()
    loadChapters()
  } catch (error) {
    showChapterMessage(error.message || '操作失败', 'error')
  } finally {
    chapterEntryDialog.submitting = false
  }
}

async function deleteChapter(chapter) {
  if (!window.confirm(`确认删除章节《${chapter.chapterTitle || chapter.id}》吗？`)) {
    return
  }

  try {
    await request(`/api/v1/admin/learning/books/chapters/${encodeURIComponent(chapter.id)}`, { method: 'DELETE' })
    showChapterMessage('删除成功')
    loadChapters()
  } catch (error) {
    showChapterMessage(error.message || '删除失败', 'error')
  }
}

onMounted(async () => {
  await refreshAdminPermissions()
  await Promise.all([loadCategoryOptions(), loadExamPaperOptions()])

  if (activeTab.value === 'categories') {
    await loadCategories()
  } else {
    await loadBooks()
  }
})
</script>

<style scoped>
.book-page__tab-button--active {
  color: #ffffff;
  background: #348fe7;
  border-color: #348fe7;
}

.book-table__name {
  min-width: 180px;
  white-space: normal;
}

.book-table__name strong,
.book-table__name span {
  display: block;
}

.book-table__name span {
  margin-top: 6px;
  color: #64748b;
  font-size: 12px;
}

.image-thumb--book {
  width: 58px;
  height: 78px;
  border-radius: 8px;
}

.book-modal {
  width: min(860px, 100%);
}

.category-modal {
  width: min(1320px, 100%);
}

.category-modal__loading {
  padding: 28px;
  color: #64748b;
}

.category-linking {
  display: grid;
  gap: 18px;
  padding: 0 18px 18px;
}

.category-linking__section {
  padding: 18px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

.category-linking__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.category-linking__header h4,
.category-linking__header p {
  margin: 0;
}

.category-linking__header p {
  margin-top: 6px;
  color: #64748b;
  font-size: 13px;
}

.category-linking__filter {
  margin: 0 0 14px;
  padding: 0;
  background: transparent;
  border: 0;
}

.category-linking__table {
  min-width: 980px;
}

.category-linking__pagination {
  margin-top: 14px;
  padding-right: 0;
  padding-left: 0;
  border: 0;
}

.chapter-modal {
  width: min(1260px, 100%);
}

.chapter-modal__body {
  padding: 18px;
}

.chapter-modal__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.chapter-modal__toolbar p {
  margin: 0;
  color: #64748b;
  font-size: 13px;
}

.chapter-modal__pagination {
  margin-top: 16px;
  padding-right: 0;
  padding-left: 0;
  border: 0;
}

.chapter-entry-modal {
  width: min(760px, 100%);
}

.chapter-table__title {
  display: flex;
  align-items: center;
  min-width: 220px;
  white-space: normal;
}

.chapter-table__indent {
  display: inline-block;
  flex: 0 0 auto;
}

.chapter-table__title strong {
  font-weight: 600;
}

.edit-form__full {
  grid-column: 1 / -1;
}

@media (max-width: 900px) {
  .chapter-modal__toolbar,
  .category-linking__header {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
