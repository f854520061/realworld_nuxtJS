<template>
  <div class="profile-page">
    <div class="user-info">
      <div class="container">
        <div class="row">
          <div class="col-xs-12 col-md-10 offset-md-1">
            <img :src="profile.image" class="user-img" />
            <h4>{{ profile.username }}</h4>
            <p>
              {{ profile.bio }}
            </p>
            <button
              v-if="user.username !== profile.username"
              class="btn btn-sm btn-outline-secondary action-btn"
              @click="onFollow"
            >
              <i class="ion-plus-round"></i>
              &nbsp;
              {{
                (profile.following ? "Unfollow " : "Follow ") + profile.username
              }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="row">
        <div class="col-xs-12 col-md-10 offset-md-1">
          <div class="articles-toggle">
            <ul class="nav nav-pills outline-active">
              <li class="nav-item">
                <span
                  @click="onTab(1)"
                  style="cursor: pointer"
                  class="nav-link"
                  :class="{
                    active: tab === 1,
                  }"
                  >My Articles</span
                >
              </li>
              <li class="nav-item">
                <span
                  @click="onTab(2)"
                  style="cursor: pointer"
                  class="nav-link"
                  :class="{
                    active: tab === 2,
                  }"
                  >Favorited Articles</span
                >
              </li>
            </ul>
          </div>

          <div
            class="article-preview"
            v-for="article in articleList.articles"
            :key="article.slug"
          >
            <div class="article-meta">
              <nuxt-link
                :to="{
                  name: 'profile',
                  params: {
                    username: article.author.username,
                  },
                }"
              >
                <img :src="article.author.image" />
              </nuxt-link>
              <div class="info">
                <nuxt-link
                  :to="{
                    name: 'profile',
                    params: {
                      username: article.author.username,
                    },
                  }"
                  class="author"
                  >{{ article.author.username }}</nuxt-link
                >
                <span class="date">{{ article.createdAt | date }}</span>
              </div>
              <button
                class="btn btn-outline-primary btn-sm pull-xs-right"
                :class="{
                  active: article.favoritesCount > 0,
                }"
                @click="onFavorite(article)"
              >
                <i class="ion-heart"></i> {{ article.favoritesCount }}
              </button>
            </div>
            <nuxt-link
              :to="{
                name: 'article',
                params: {
                  slug: article.slug,
                },
              }"
              class="preview-link"
            >
              <h1>{{ article.title }}</h1>
              <p>{{ article.description }}</p>
              <span>Read more...</span>
            </nuxt-link>
          </div>

          <nav>
            <ul class="pagination">
              <li
                class="page-item"
                v-for="item in totalPage"
                :key="item"
                :class="{
                  active: page === item,
                }"
              >
                <span @click="getPage(item)" class="page-link" to="">{{
                  item
                }}</span>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getProfile } from "@/api/profile";
import { getArticles, addFavorite, delFavorite } from "@/api/article";
import { followUser, unfollowUser } from "@/api/user";
import { mapState } from "vuex";

export default {
  middleware: "authenticated",
  name: "ProfileIndex",
  data() {
    return {
      reFresh: true,
      profile: {
        image: "",
        bio: "",
        username: "",
        following: false,
      },
      articleList: {
        articles: [],
        articlesCount: 0,
      },
      page: 1,
      limit: 1,
      tab: 1,
    };
  },
  async mounted() {
    const { username } = this.$route.params;
    const [profile, articleRes] = await Promise.all([
      getProfile(username),
      getArticles({
        author: username,
        limit: this.limit,
        offset: (this.page - 1) * this.limit,
      }),
    ]);

    const { articles } = articleRes.data;
    articles.forEach((article) => (article.favoriteDisabled = false));

    this.profile = {
      ...profile.data.profile,
      followDisabled: false,
    };
    this.articleList = articleRes.data;
  },
  computed: {
    totalPage() {
      return Math.ceil(this.articleList.articlesCount / this.limit);
    },
    ...mapState(["user"]),
  },
  methods: {
    async getPage(page) {
      const { username } = this.$route.params;
      const params = {
        limit: this.limit,
        offset: (page - 1) * this.limit,
      };
      if (this.tab === 1) {
        params.author = username;
      } else {
        params.favorited = username;
      }

      const { data } = await getArticles(params);
      data.articles.forEach((article) => (article.favoriteDisabled = false));

      this.articleList = data;
      this.page = page;
    },

    async onTab(type) {
      if (this.tab === type) return;
      const { username } = this.$route.params;
      const params = {
        limit: this.limit,
        offset: 0,
      };
      if (type === 1) {
        params.author = username;
      } else {
        params.favorited = username;
      }

      const { data } = await getArticles(params);
      data.articles.forEach((article) => (article.favoriteDisabled = false));

      this.articleList = data;
      this.page = 1;
      this.tab = type;
    },

    async onFavorite(article) {
      article.favoriteDisabled = true;
      if (article.favorited) {
        await delFavorite(article.slug);
        article.favorited = false;
        article.favoritesCount += -1;
      } else {
        await addFavorite(article.slug);
        article.favorited = true;
        article.favoritesCount += 1;
      }
      article.favoriteDisabled = false;
    },

    async onFollow() {
      const author = this.profile;
      author.followDisabled = true;
      if (author.following) {
        await unfollowUser(author);
        author.following = false;
      } else {
        await followUser(author);
        author.following = true;
      }
      author.followDisabled = false;
    },
  },
  watch: {
    "$route.params.username"(to, from, e) {
      window.location.reload();
    },
  },
};
</script>

<style>
</style>