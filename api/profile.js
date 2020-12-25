import { request } from '@/plugins/request'

// 获取公共文章列表
export const getProfile = username => {
    return request({
        method: 'GET',
        url: `/api/profiles/${username}`
    })
}