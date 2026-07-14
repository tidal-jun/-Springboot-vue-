package org.example.service;

import java.util.Collection;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * Redis 操作服务接口
 */
public interface RedisService {

    // ========== String 操作 ==========

    /**
     * 设置值
     */
    void set(String key, Object value);

    /**
     * 设置值并指定过期时间
     */
    void set(String key, Object value, long timeout, TimeUnit unit);

    /**
     * 获取值
     */
    <T> T get(String key);

    /**
     * 删除 key
     */
    boolean delete(String key);

    /**
     * 批量删除 key
     */
    long delete(Collection<String> keys);

    /**
     * 判断 key 是否存在
     */
    boolean hasKey(String key);

    /**
     * 设置过期时间
     */
    boolean expire(String key, long timeout, TimeUnit unit);

    /**
     * 获取剩余过期时间
     */
    long getExpire(String key, TimeUnit unit);

    // ========== Hash 操作 ==========

    /**
     * 设置 Hash 值
     */
    void setHash(String key, String hashKey, Object value);

    /**
     * 获取 Hash 值
     */
    <T> T getHash(String key, String hashKey);

    /**
     * 删除 Hash 中的字段
     */
    long deleteHash(String key, Object... hashKeys);

    // ========== 自增/自减 ==========

    /**
     * 自增（返回自增后的值）
     */
    long increment(String key, long delta);

    /**
     * Hash 自增
     */
    long incrementHash(String key, String hashKey, long delta);

    // ========== 集合操作 ==========

    /**
     * 获取所有匹配 pattern 的 key
     */
    List<String> keys(String pattern);
}
