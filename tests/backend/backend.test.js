const assert = require('node:assert');
const { isValidUrl, cleanUrl } = require('../../backend/src/services/url.service');
const { detectPlatform } = require('../../backend/src/services/platform.service');

console.log('🚀 Running Backend Core Unit Tests...');

try {
  // 1. Test cleanUrl utility
  console.log('\nTesting cleanUrl...');
  assert.strictEqual(cleanUrl('instagram.com/p/123'), 'https://instagram.com/p/123');
  assert.strictEqual(cleanUrl('  https://tiktok.com/abc  '), 'https://tiktok.com/abc');
  console.log('✅ cleanUrl checks passed.');

  // 2. Test isValidUrl validator
  console.log('\nTesting isValidUrl...');
  assert.strictEqual(isValidUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ'), true);
  assert.strictEqual(isValidUrl('instagram.com/reel/C_abc123/'), true);
  assert.strictEqual(isValidUrl('not-a-url'), false);
  assert.strictEqual(isValidUrl(''), false);
  console.log('✅ isValidUrl checks passed.');

  // 3. Test detectPlatform resolver
  console.log('\nTesting detectPlatform...');
  assert.strictEqual(detectPlatform('https://www.tiktok.com/@user/video/12345'), 'tiktok');
  assert.strictEqual(detectPlatform('instagram.com/p/abc'), 'instagram');
  assert.strictEqual(detectPlatform('https://youtu.be/dQw4w9WgXcQ'), 'youtube');
  assert.strictEqual(detectPlatform('https://www.facebook.com/watch?v=123'), 'facebook');
  assert.strictEqual(detectPlatform('x.com/user/status/1234'), 'twitter');
  assert.strictEqual(detectPlatform('https://www.reddit.com/r/funny/comments/xyz/post'), 'reddit');
  assert.strictEqual(detectPlatform('https://vimeo.com/123456789'), 'vimeo');
  assert.strictEqual(detectPlatform('https://www.twitch.tv/videos/123456'), 'twitch');
  assert.strictEqual(detectPlatform('https://google.com'), 'unknown');
  console.log('✅ detectPlatform checks passed.');

  console.log('\n🎉 All core backend unit tests completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('\n❌ Unit test suite failed:', error.message);
  process.exit(1);
}
