import test from "node:test";
import assert from "node:assert/strict";
import {resolveAIProxyEndpoint} from "../src/ai/proxy-config.js";

test("uses same-origin proxy only for local Node development",()=>{
  assert.equal(resolveAIProxyEndpoint({hostname:"127.0.0.1",origin:"http://127.0.0.1:8787"}),"/api/teacher");
  assert.equal(resolveAIProxyEndpoint({hostname:"localhost",origin:"http://localhost:8787"}),"/api/teacher");
});

test("does not invent a backend for GitHub Pages",()=>{
  assert.equal(resolveAIProxyEndpoint({
    hostname:"tymo1985-debug.github.io",
    origin:"https://tymo1985-debug.github.io"
  }),null);
});

test("builds teacher endpoint from configured external backend",()=>{
  assert.equal(resolveAIProxyEndpoint({
    configuredUrl:"https://api.example.com/",
    hostname:"tymo1985-debug.github.io",
    origin:"https://tymo1985-debug.github.io"
  }),"https://api.example.com/api/teacher");
});
