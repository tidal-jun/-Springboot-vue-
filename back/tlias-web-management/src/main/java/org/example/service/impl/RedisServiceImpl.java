package org.example.service.impl;

import org.example.service.RedisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class RedisServiceImpl implements RedisService {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    // ========== String 操作 ==========

    @Override
    public void set(String key, Object value) {
        redisTemplate.opsForValue().set(key, value);
    }

    @Override
    public void set(String key, Object value, long timeout, TimeUnit unit) {
        redisTemplate.opsForValue().set(key, value, timeout, unit);
    }

    @Override
    @SuppressWarnings("unchecked")
    public <T> T get(String key) {
        return (T) redisTemplate.opsForValue().get(key);
    }

    @Override
    public boolean delete(String key) {
        return Boolean.TRUE.equals(redisTemplate.delete(key));
    }

    @Override
    public long delete(Collection<String> keys) {
        Long result = redisTemplate.delete(keys);
        return result != null ? result : 0;
    }

    @Override
    public boolean hasKey(String key) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }

    @Override
    public boolean expire(String key, long timeout, TimeUnit unit) {
        return Boolean.TRUE.equals(redisTemplate.expire(key, timeout, unit));
    }

    @Override
    public long getExpire(String key, TimeUnit unit) {
        Long expire = redisTemplate.getExpire(key, unit);
        return expire != null ? expire : -1;
    }

    // ========== Hash 操作 ==========

    @Override
    public void setHash(String key, String hashKey, Object value) {
        redisTemplate.opsForHash().put(key, hashKey, value);
    }

    @Override
    @SuppressWarnings("unchecked")
    public <T> T getHash(String key, String hashKey) {
        return (T) redisTemplate.opsForHash().get(key, hashKey);
    }

    @Override
    public long deleteHash(String key, Object... hashKeys) {
        Long result = redisTemplate.opsForHash().delete(key, hashKeys);
        return result != null ? result : 0;
    }

    // ========== 自增/自减 ==========

    @Override
    public long increment(String key, long delta) {
        Long result = redisTemplate.opsForValue().increment(key, delta);
        return result != null ? result : 0;
    }

    @Override
    public long incrementHash(String key, String hashKey, long delta) {
        Long result = redisTemplate.opsForHash().increment(key, hashKey, delta);
        return result != null ? result : 0;
    }

    // ========== 集合操作 ==========

    @Override
    public List<String> keys(String pattern) {
        return redisTemplate.keys(pattern)
                .stream()
                .map(Object::toString)
                .collect(Collectors.toList());
    }
}
