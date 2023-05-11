import { render, h } from "https://esm.sh/preact@10.13.2";
import {
  useState,
  useRef,
  useEffect,
} from "https://esm.sh/preact@10.13.2/hooks";
import htm from "https://esm.sh/htm@3.1.1";
import Linkify from "https://esm.sh/react-linkify@0.2.2?alias=react:preact/compat";
import { Route, Switch, Link, useLocation } from "https://esm.sh/wouter-preact@2.9.0";
if(location.hash.startsWith("#path=")) {
  history.replaceState(null, "", location.hash.slice(6))
}
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
const html = htm.bind(h);
function useTitle(title) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}
function Home() {
  useTitle("TwitterView");
  const input = useRef();
  const navigate = useLocation()[1];
  return html`
    <form
      onSubmit=${(e) => {
        e.preventDefault();
        navigate(new URL(input.current.value).pathname);
      }}
    >
      <input type="url" placeholder="Tweet URL..." ref=${input} /><button>
        Go
      </button>
    </form>
  `;
}
function NotFound() {
  useTitle("Not Found - TwitterView");
  return html`<div class="error">Page not found.</div>`;
}
function APIAuthorComponent({ tweet, quote }) {
  const { author } = tweet;
  return html`
    <div class="author">
      <img src=${author.avatar_url} alt=${author.name} />${" "}
      <a
        target="_blank"
        class="author-info"
        href=${"https://twitter.com/" + author.screen_name}
        title="View profile on Twitter"
      >
        <span class="name">${author.name}</span>${quote && "\xa0"}
        <span class="handle">@${author.screen_name}</span>
      </a>
      ${quote
        ? html`<span class="date"
            >${"\xa0·\xa0"}<a target="_blank" href=${tweet.url}
              >${dateFormat.format(new Date(tweet.created_at))}</a
            ></span
          >`
        : html`<a
            class="bird"
            href=${tweet.url}
            target="_blank"
            title="View on Twitter"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" width="24px">
              <path
                fill="#1d9bf0"
                d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"
              ></path>
            </svg>
          </a>`}
    </div>
  `;
}

function APIPollComponent({ poll }) {
  return html`
    <div class="poll">
      <ul>
        ${poll.choices.map(
          (choice) =>
            html`<li style=${{ "--percentage": `${choice.percentage}%` }}>
              <span class="label">${choice.label}</span
              ><span class="percentage">${choice.percentage}%</span>
            </li>`
        )}
      </ul>
      <p class="stats">${poll.total_votes} votes · ${poll.time_left_en}</p>
    </div>
  `;
}

function APIExternalMediaComponent({ media }) {
  return html`
    <iframe src=${media.url} title="External Media"></iframe>
  `;
}

function APIPhotoComponent({ photo }) {
  return html`
    <a href=${photo.url} target="_blank">
      <img
        src=${photo.url}
        alt=${photo.altText}
        width=${photo.width}
        height=${photo.height}
      />
    </a>
  `;
}

function APIVideoComponent({ video }) {
  return html`
    <video
      src=${video.url}
      width=${video.width}
      height=${video.height}
      controls
      poster=${video.thumbnail_url}
    ></video>
  `;
}

const timeFormat = new Intl.DateTimeFormat(navigator.languages, {
  hour: "numeric",
  minute: "numeric",
});

const dateFormat = new Intl.DateTimeFormat(navigator.languages, {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function formatDate(date) {
  return timeFormat.format(date) + " · " + dateFormat.format(date);
}

function mediaCount(tweet) {
  let count = 0;
  if (!tweet.media) return count;
  if (tweet.media.external) count++;
  if (tweet.media.photos) count += tweet.media.photos.length;
  if (tweet.media.videos) count += tweet.media.videos.length;
  return count;
}

function ShortenedLink({ href, children }) {
  const url = new URL(href);
  if (!(url.protocol === "https:" || url.protocol === "http:")) return children;
  let rest = url.pathname + url.search + url.hash;
  if (rest.length > 15) rest = rest.slice(0, 15) + "...";
  return html`<a target="_blank" href=${href} title=${href}
    >${url.hostname}${rest}</a
  >`;
}

function APITweetComponent({ tweet, quote }) {
  const quoteRef = useRef();
  const navigate = useLocation()[1];
  return html`
    <${APIAuthorComponent} tweet=${tweet} quote=${quote} />
    <p><${Linkify} component=${ShortenedLink}>${tweet.text}</${Linkify}></p>
    ${tweet.poll ? html`<${APIPollComponent} poll=${tweet.poll} />` : ""}
    ${
      tweet.media &&
      html`<div
        class="media"
        style=${{
          gridTemplateColumns: `repeat(${mediaCount(tweet) > 1 ? 2 : 1}, 1fr)`,
        }}
      >
        ${tweet.media.external
          ? html`<${APIExternalMediaComponent} media=${tweet.media.external} />`
          : ""}
        ${tweet.media.photos
          ? tweet.media.photos.map(
              (photo) => html`<${APIPhotoComponent} photo=${photo} />`
            )
          : ""}
        ${tweet.media.videos
          ? tweet.media.videos.map(
              (video) => html`<${APIVideoComponent} video=${video} />`
            )
          : ""}
      </div>`
    }
    ${
      tweet.quote
        ? html`<button
            class="quote"
            ref=${quoteRef}
            onClick=${(e) => {
              if (e.target.closest("button, a") !== quoteRef.current) return;
              navigate(new URL(tweet.quote.url).pathname);
            }}
          >
            <${APITweetComponent} tweet=${tweet.quote} quote />
          </button>`
        : ""
    }
    ${
      !quote &&
      html`<div class="date">
        <a target="_blank" href=${tweet.url}>
          ${formatDate(new Date(tweet.created_at))}
        </a>
      </div>`
    }
  `;
}

function Tweet({ id }) {
  const [state, setState] = useState({ loading: true });
  const navigate = useLocation()[1];
  useTitle("TwitterView - Tweet");
  useEffect(() => {
    setState({ loading: true });
  }, [id]);
  useEffect(async () => {
    try {
      const data = await (
        await fetch("https://api.fxtwitter.com/status/" + id)
      ).json();
      if (data.message !== "OK") throw new Error(data);
      setState({ data });
    } catch (e) {
      console.error(e);
      setState({ error: true });
    }
  }, [id]);
  if (state.loading) return html`<div class="loading">Loading...</div>`;
  if (state.error)
    return html`<div class="error">There was an error loading the tweet.</div>`;
  const tweet = state.data.tweet;
  useTitle(`${tweet.author.name} on TwitterView: "${tweet.text}"`);
  useEffect(() => {
    navigate(new URL(tweet.url).pathname, {replace: true})
  }, [tweet.url])
  return html`<${APITweetComponent} tweet=${tweet} />`;
}
function App() {
  const tweet = ({ id }) => html`<${Tweet} id=${id} />`
  return html`<${Switch}>
    <${Route} path="/"><${Home}/></Route>
    <${Route} path="/i/web/status/:id">${tweet}</Route>
    <${Route} path="/:user/status/:id">${tweet}</Route>
    <${Route} path="/i/web/status/:id/:rest*">${tweet}</Route>
    <${Route} path="/:user/status/:id/:rest*">${tweet}</Route>
    <${Route}><${NotFound}/></Route>
  </${Switch}>
  `;
}

render(html`<h1><${Link} href="/">TwitterView</Link></h1><div class="page"><${App} /></div>`, document.body);
