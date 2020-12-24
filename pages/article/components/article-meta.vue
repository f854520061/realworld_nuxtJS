<template>
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
        class="author"
        :to="{
          name: 'profile',
          params: {
            username: article.author.username,
          },
        }"
      >
        {{ article.author.username }}
      </nuxt-link>
      <span class="date">{{ article.createdAt | date }}</span>
    </div>
    <button 
      class="btn btn-sm btn-outline-secondary" 
      :class="{active: article.author.following}"
      :disabled="article.author.followDisabled"
      @click="onFollow"
      >
      <i class="ion-plus-round"></i>
      &nbsp; {{ (article.author.following ? "Unfollow " : "Follow ") + article.author.username }}
    </button>
    &nbsp;&nbsp;
    <button 
      class="btn btn-sm btn-outline-primary" 
      :class="{active: article.author.favorited}"
      :disabled="article.favoriteDisabled"
      @click="onFavorite">
      <i class="ion-heart"></i>
      &nbsp; Favorite Post <span class="counter">({{ article.favoritesCount }})</span>
    </button>
  </div>
</template>

<script>
import { addFavorite, delFavorite } from '@/api/article'
import { followUser, unfollowUser } from '@/api/user'
import { mapState } from 'vuex'

export default {
  name: "articleMeta",
  props: {
    article: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapState(['user'])
  },
  methods: {
    async onFavorite () {
      if (!this.user) {
        this.$router.push({
          name: 'login',
        })
        return;
      }
      const { article } = this;
      article.favoriteDisabled = true
      if (article.favorited) {
        await delFavorite(article.slug)
        article.favorited = false
        article.favoritesCount += -1
      } else {
        await addFavorite(article.slug)
        article.favorited = true
        article.favoritesCount += 1
      }
      article.favoriteDisabled = false
    },
    async onFollow () {
      if (!this.user) {
        this.$router.push({
          name: 'login',
        })
        return;
      }
      const { author } = this.article;
      author.followDisabled = true
      if (author.following) {
        await unfollowUser(author)
        author.following = false
      } else {
        await followUser(author)
        author.following = true
      }
      author.followDisabled = false
    }
  }
};
</script>

<style>
</style>