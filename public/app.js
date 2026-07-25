const state={page:1,pages:1,searching:false};
const $=id=>document.getElementById(id);
const esc=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));

function paperLinks(paper){
  const links=[];
  if(paper.source_url)links.push(`<a href="${esc(paper.source_url)}" target="_blank" rel="noopener">Paper</a>`);
  if(paper.pdf_url)links.push(`<a href="${esc(paper.pdf_url)}" target="_blank" rel="noopener">PDF</a>`);
  else if(paper.arxiv_id)links.push(`<a href="https://arxiv.org/pdf/${esc(paper.arxiv_id)}.pdf" target="_blank" rel="noopener">PDF</a>`);
  if(paper.doi)links.push(`<a href="https://doi.org/${esc(paper.doi)}" target="_blank" rel="noopener">DOI</a>`);
  if(paper.report_path)links.push(`<a class="report" href="/${esc(paper.report_path)}">Read report</a>`);
  return links.join("");
}

function card(paper){
  const memberships=(paper.venue_memberships||`${paper.venue||""} ${paper.year||""}`).split("|").filter(Boolean);
  return `<article class="paper">
    <div class="title">${esc(paper.title)}</div>
    <div class="meta">${memberships.map(item=>`<span class="chip">${esc(item)}</span>`).join("")}</div>
    ${paper.authors?`<div class="authors">${esc(paper.authors)}</div>`:""}
    ${paper.organizations?`<div class="organizations">${esc(paper.organizations)}</div>`:""}
    ${paper.abstract?`<details class="abstract"><summary>Abstract</summary><p>${esc(paper.abstract)}</p></details>`:""}
    <div class="links">${paperLinks(paper)}</div>
  </article>`;
}

async function request(path){
  const response=await fetch(path);
  const data=await response.json();
  if(!response.ok)throw new Error(data.error||`Request failed (${response.status})`);
  return data;
}

async function load(reset=false){
  if(reset)state.page=1;
  const query=$("query").value.trim();
  const params=new URLSearchParams({venue:$("venue").value,year:$("year").value});
  state.searching=Boolean(query);
  if(query)params.set("q",query);else{params.set("page",state.page);params.set("per_page","50");}
  $("status").textContent="Loading…";
  try{
    const data=await request(`${query?"/api/search":"/api/papers"}?${params}`);
    const papers=query?(data.matches||[]):(data.papers||[]);
    state.pages=query?1:(data.pages||1);
    $("papers").innerHTML=papers.length?papers.map(card).join(""):'<div class="empty">No matching papers</div>';
    $("status").textContent=query?`${papers.length} search results`:`${Number(data.total).toLocaleString()} papers`;
    $("page").textContent=query?"Search":`${data.page} / ${state.pages}`;
    $("previous").disabled=query||state.page<=1;$("next").disabled=query||state.page>=state.pages;
  }catch(error){$("papers").innerHTML=`<div class="empty">${esc(error.message)}</div>`;$("status").textContent="Unable to load papers";}
}

async function start(){
  try{
    const facets=await request("/api/facets");
    for(const item of facets.venues)$("venue").insertAdjacentHTML("beforeend",`<option value="${esc(item.venue)}">${esc(item.venue)} (${Number(item.count).toLocaleString()})</option>`);
    for(const item of facets.years)$("year").insertAdjacentHTML("beforeend",`<option value="${item.year}">${item.year} (${Number(item.count).toLocaleString()})</option>`);
  }finally{await load();}
}

let timer;$("query").addEventListener("input",()=>{clearTimeout(timer);timer=setTimeout(()=>load(true),300)});
$("query").addEventListener("keydown",event=>{if(event.key==="Enter"){event.preventDefault();load(true)}});
$("venue").addEventListener("change",()=>load(true));$("year").addEventListener("change",()=>load(true));
$("previous").addEventListener("click",()=>{state.page-=1;load()});$("next").addEventListener("click",()=>{state.page+=1;load()});
start();

