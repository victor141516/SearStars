import { defineComponent, useSSRContext, mergeProps, resolveComponent, createApp } from "vue";
import { DateTime } from "luxon";
import { useRouter, createRouter, createWebHistory } from "vue-router";
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate, ssrRenderClass, ssrRenderStyle, ssrRenderList, ssrRenderComponent } from "vue/server-renderer";
const _sfc_main$2 = defineComponent({ name: "Loader" });
const Loader_vue_vue_type_style_index_0_scoped_db56ddf1_lang = "";
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
function _sfc_ssrRender$2(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "loader" }, _attrs))} data-v-db56ddf1>Loading...</div>`);
}
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/Loader.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const Loader = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["ssrRender", _sfc_ssrRender$2], ["__scopeId", "data-v-db56ddf1"], ["__file", "/Users/victor141516/Code/Mine/SearStars/sear-stars/src/components/Loader.vue"]]);
const _sfc_main$1 = defineComponent({
  name: "StarItem",
  props: {
    projectData: {
      type: Object,
      required: true
    }
  },
  computed: {
    languageColor() {
      const code = this.projectData.language.split("").map((c) => c.charCodeAt(0)).reduce((n, sum) => sum + n, 0);
      const colors = ["gray", "red", "orange", "yellow", "green", "teal", "blue", "indigo", "purple", "pink"];
      const numbers = ["300", "500", "800"];
      const color = colors[code % colors.length];
      const number = numbers[code % numbers.length];
      return `bg-${color}-${number}`;
    },
    updatedStr() {
      const diff = DateTime.utc().diff(this.projectData.updatedDate);
      const hours = diff.shiftTo("hours").hours;
      const days = diff.shiftTo("days").days;
      const months = diff.shiftTo("months").months;
      const years = diff.shiftTo("years").years;
      if (hours < 1)
        return "recently";
      else if (days < 1)
        return `${Math.round(hours)} ${Math.round(hours) === 1 ? "hour" : "hours"} ago`;
      else if (months < 1)
        return `${Math.round(days)} ${Math.round(days) === 1 ? "day" : "days"} ago`;
      else if (years < 1)
        return `${Math.round(months)} ${Math.round(months) === 1 ? "month" : "months"} ago`;
      else
        return `${years} years ago`;
    }
  }
});
function _sfc_ssrRender$1(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "border border-gray-200 bg-gray-200 rounded-lg shadow-lg" }, _attrs))}><div class="px-4 pb-2 pt-1 border border-l-0 border-t-0 border-r-0 border-gray-400"><a${ssrRenderAttr("href", `https://github.com/${_ctx.projectData.owner}/${_ctx.projectData.project}`)} class="hover:underline text-blue-600 text-3xl"><h2 class="flex flex-wrap"><span>${ssrInterpolate(_ctx.projectData.owner)}</span><span class="mx-2">/</span><span class="font-bold">${ssrInterpolate(_ctx.projectData.project)}</span></h2></a></div><div class="p-4 mt-2 text-gray-600"><p>${ssrInterpolate(_ctx.projectData.description)}</p><div class="mt-5 flex flex-wrap md:w-10/12 md:mx-auto"><div class="px-2 flex-1 flex items-center justify-start"><span class="${ssrRenderClass([_ctx.languageColor, "w-4 h-4 rounded-full"])}"></span><span class="ml-1">${ssrInterpolate(_ctx.projectData.language)}</span></div><div class="px-2 flex-1 flex items-center justify-start"><span>⭐</span><span class="ml-1">${ssrInterpolate(_ctx.projectData.stars.toLocaleString())}</span></div><div class="px-2 flex-1 flex items-center justify-start"><span>🍴</span><span class="ml-1">${ssrInterpolate(_ctx.projectData.forks)}</span></div><div class="px-2 flex-1 flex items-center justify-start whitespace-no-wrap"><span>Updated ${ssrInterpolate(_ctx.updatedStr)}</span></div></div></div></div>`);
}
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/StarItem.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const StarItem = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["ssrRender", _sfc_ssrRender$1], ["__file", "/Users/victor141516/Code/Mine/SearStars/sear-stars/src/components/StarItem.vue"]]);
class GitHubRateLimitError extends Error {
}
const _fetch = (...args) => fetch(...args).then((r) => {
  if (r.status === 403)
    throw new GitHubRateLimitError();
  return r;
});
async function* getStars(username) {
  const { firstPage, pages } = await _fetch(
    `https://api.github.com/users/${username}/starred`
  ).then((r) => {
    var _a;
    return {
      firstPage: r.json(),
      pages: Number.parseInt(
        ((_a = r.headers.get("link")) == null ? void 0 : _a.split('rel="next"')[1].split('rel="last"')[0].split("?page=")[1].split(">")[0]) ?? "0"
      )
    };
  });
  const translate = (i) => {
    const owner = i.owner.login;
    const project = i.name;
    const description = i.description;
    const language = i.language ?? "Other";
    const stars = i.stargazers_count;
    const forks = i.forks_count;
    const updatedDate = DateTime.fromISO(i.updated_at);
    return {
      owner,
      project,
      description,
      language,
      stars,
      forks,
      updatedDate
    };
  };
  for (const item of await firstPage) {
    yield translate(item);
  }
  const requests = new Array(pages).fill(null).map(
    (_, i) => _fetch(
      `https://api.github.com/users/${username}/starred?page=${i + 1}`
    ).then((r) => r.json())
  );
  const raws = (await Promise.all(requests)).flat();
  for (const i of raws) {
    yield translate(i);
  }
}
const _sfc_main = defineComponent({
  name: "App",
  components: { Loader, StarItem },
  data() {
    return {
      username: "",
      inputSearchText: "",
      internalSearchText: "",
      stars: [],
      loading: false,
      rateLimitError: true
    };
  },
  computed: {
    filteredItems() {
      let filtered = [];
      if (this.internalSearchText === "")
        filtered = this.stars;
      else {
        filtered = this.stars.filter((i) => {
          var _a, _b, _c, _d;
          return ((_a = i.owner) == null ? void 0 : _a.toLowerCase().includes(this.internalSearchText.toLowerCase())) || ((_b = i.project) == null ? void 0 : _b.toLowerCase().includes(this.internalSearchText.toLowerCase())) || ((_c = i.description) == null ? void 0 : _c.toLowerCase().includes(this.internalSearchText.toLowerCase())) || ((_d = i.language) == null ? void 0 : _d.toLowerCase().includes(this.internalSearchText.toLowerCase()));
        });
      }
      return filtered.filter(
        (el, index, all) => all.findIndex(
          (ell) => ell.owner === el.owner && ell.project === el.project
        ) === index
      );
    }
  },
  mounted() {
    useRouter().beforeEach(async (to, _, next) => {
      if (to.query.s) {
        this.internalSearchText = to.query.s;
      } else {
        this.internalSearchText = "";
      }
      this.inputSearchText = this.internalSearchText;
      const username = Array.isArray(to.params.username) ? to.params.username[0] : to.params.username;
      next();
      if (username) {
        this.username = username;
        const stars = [];
        this.loading = true;
        try {
          for await (const star of getStars(username)) {
            stars.push(star);
          }
          this.rateLimitError = false;
        } catch {
          this.rateLimitError = true;
        }
        this.loading = false;
        this.stars = stars;
      } else {
        this.username = "";
        this.stars = [];
      }
    });
  },
  methods: {
    updateSearchUrl() {
      this.$router.push({
        path: this.$route.path,
        query: { s: this.inputSearchText }
      });
    }
  }
});
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_StarItem = resolveComponent("StarItem");
  const _component_Loader = resolveComponent("Loader");
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex flex-col items-center" }, _attrs))}><div class="${ssrRenderClass([{ "shadow-xl": _ctx.stars.length > 0 }, "pt-6 md:pt-12 pb-6 px-2 w-full bg-pink-600 sticky top-0 z-10"])}"><div class="sm:w-10/12 md:w-8/12 xl:w-6/12 2xl:w-4/12 w-full flex flex-col mx-auto"><a href="/" class="self-center"><div class="bg-white py-1 px-4 rounded-sm shadow-md"><h1 class="text-3xl text-gray-800">Search an user GitHub stars</h1></div></a><div class="mt-8 flex-1 flex flex-wrap"><form method="get"${ssrRenderAttr("action", `/${_ctx.username}`)} class="flex-1 self-start flex mt-2"><input${ssrRenderAttr("value", _ctx.username)} type="text" class="text-gray-800 focus:bg-gray-200 outline-none rounded-md shadow-sm py-2 px-4" placeholder="Username"><button type="submit" class="font-bold text-gray-800 focus:outline-none ml-8 p-2 rounded-md shadow-sm bg-pink-300 hover:bg-pink-500 active:bg-pink-800 active:text-white w-20"> Get </button></form>`);
  if (_ctx.stars.length > 0) {
    _push(`<div class="mt-2"><input${ssrRenderAttr("value", _ctx.inputSearchText)} type="text" class="text-gray-800 focus:bg-gray-200 outline-none rounded-md shadow-sm py-2 px-4" placeholder="Search"></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div></div></div><div class="sm:w-10/12 md:w-8/12 xl:w-6/12 2xl:w-4/12 w-full h-full px-2 py-4">`);
  if (_ctx.rateLimitError) {
    _push(`<div class="text-3xl text-center bg-white py-4 px-2 rounded shadow"><p class="sticky"> You checked a few users and GitHub API limited your access 😔 </p><p>Try again in a few hours</p></div>`);
  } else if (_ctx.stars.length > 0) {
    _push(`<div><div class="mt-8 mx-auto pr-1" style="${ssrRenderStyle({ "width": "95%" })}"><!--[-->`);
    ssrRenderList(_ctx.filteredItems, (star) => {
      _push(ssrRenderComponent(_component_StarItem, {
        key: `${star.owner}/${star.project}`,
        "project-data": star,
        class: "my-4"
      }, null, _parent));
    });
    _push(`<!--]--></div></div>`);
  } else if (_ctx.loading) {
    _push(`<div><div class="flex items-center justify-center" style="${ssrRenderStyle({ "height": "60vh" })}">`);
    _push(ssrRenderComponent(_component_Loader, null, null, _parent));
    _push(`</div></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/App.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__file", "/Users/victor141516/Code/Mine/SearStars/sear-stars/src/App.vue"]]);
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      name: "All",
      path: "/:username(.*)",
      component: App
    }
  ]
});
const style = "";
createApp(App).use(router).mount("#app");
