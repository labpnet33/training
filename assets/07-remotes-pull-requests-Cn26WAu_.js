var e={id:`remotes-pull-requests`,h:{en:`Remotes, push, tags and pull requests`,hi:`Remotes, push, tags aur pull requests`},body:{en:`

<p><b>One idea in this chapter:</b> so far everything lived on one computer. A <b>remote</b> is a copy of the repository on a shared server. Pushing sends your commits there so the team, and the automation tools, can use them.</p>
<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="A change travels from your laptop to main through a review gate."><rect x="10" y="28" width="128" height="68" rx="10" fill="#bae6fd"/><text x="74" y="58" text-anchor="middle" class="svg-ink" font-size="14">Your branch</text><text x="74" y="78" text-anchor="middle" class="svg-muted" font-size="12">local commits</text><line x1="138" y1="62" x2="168" y2="62" stroke="#64748b" stroke-width="2"/><polygon points="168,57 174,62 168,67" fill="#64748b"/><text x="156" y="50" text-anchor="middle" class="svg-accent" font-size="11">push</text><rect x="174" y="28" width="128" height="68" rx="10" fill="#bbf7d0"/><text x="238" y="58" text-anchor="middle" class="svg-ink" font-size="14">Remote</text><text x="238" y="78" text-anchor="middle" class="svg-muted" font-size="12">shared server</text><line x1="302" y1="62" x2="332" y2="62" stroke="#64748b" stroke-width="2"/><polygon points="332,57 338,62 332,67" fill="#64748b"/><rect x="338" y="28" width="128" height="68" rx="10" fill="#fde68a"/><text x="402" y="58" text-anchor="middle" class="svg-ink" font-size="14">Pull request</text><text x="402" y="78" text-anchor="middle" class="svg-muted" font-size="12">review + approve</text><line x1="466" y1="62" x2="496" y2="62" stroke="#64748b" stroke-width="2"/><polygon points="496,57 502,62 496,67" fill="#64748b"/><text x="484" y="50" text-anchor="middle" class="svg-accent" font-size="11">merge</text><rect x="502" y="28" width="128" height="68" rx="10" fill="#ddd6fe"/><text x="566" y="58" text-anchor="middle" class="svg-ink" font-size="14">main</text><text x="566" y="78" text-anchor="middle" class="svg-muted" font-size="12">source of truth</text></svg><p class="cap">A change travels from your laptop to main through a review gate.</p></div>

<h3>Remote and origin</h3>
<p>A remote is a named link to another copy of the repository, usually on GitLab, GitHub or a company Git server. The usual name is <code>origin</code>. The address is either an HTTPS address or an <b>SSH address</b> such as <code>git@git.example:team/netcfg.git</code>, which means "user git, on host git.example, repository team/netcfg". SSH addresses use key pairs, so no password is typed or stored in a script.</p>
<pre class="code">git remote add origin git@git.example:team/netcfg.git
git remote -v
git push origin main</pre>
<pre class="out">origin	git@git.example:team/netcfg.git (fetch)
origin	git@git.example:team/netcfg.git (push)

To git@git.example:team/netcfg.git
   * [new branch]  main -&gt; main</pre>
<p><code>git remote add</code> only records the link. <code>git remote -v</code> lists it twice, once for fetching (downloading) and once for pushing (uploading). <code>git push origin main</code> sends the commits of your local <code>main</code> to the remote branch also called <code>main</code>. <code>[new branch]</code> means the server did not have this branch before. Pushing a feature branch works the same: <code>git push origin add-vlan30</code>.</p>
<p>In Lab 2 the second push shows a range instead:</p>
<pre class="out">   faf4702..429f01a  main -&gt; main</pre>
<p>That reads "the remote main moved from commit faf4702 to commit 429f01a". (The real output starts with a <code>To</code> line that names the remote.)</p>

<h3>Tags: permanent names for a moment</h3>
<p>A <b>tag</b> is a fixed label on one commit, used for a release or a known-good baseline, such as the configuration approved for the quarter.</p>
<pre class="code">git tag before-change
git tag</pre>
<pre class="out">before-change</pre>
<p>A branch label moves forward with every commit; a tag stays where you put it. If a change goes wrong months later, the tag tells you exactly which commit was the approved baseline.</p>

<h3>The other half of the remote: clone, fetch, pull</h3>
<p>Reference configuration (not run in the simulator). The simulator host starts from files you already have and only pushes. On a real laptop you would also use:</p>
<pre class="code">git clone git@git.example:team/netcfg.git    <span class="c"># first-time copy of a remote repo</span>
git fetch origin                              <span class="c"># download new commits, change nothing locally</span>
git pull origin main                          <span class="c"># fetch, then merge into your branch</span></pre>
<p><code>clone</code> copies a whole repository to your machine. <code>fetch</code> downloads what others pushed without touching your files. <code>pull</code> is fetch plus merge. Pull before you start work, so you build on the latest main. If you push when the server has newer commits, the server <b>rejects</b> the push with a message such as <i>rejected, fetch first</i>. The cure is to pull (or fetch and merge), resolve any conflict as in chapter 5, then push again. Do not force the push over your colleagues' work.</p>

<h3>Pull requests (merge requests)</h3>
<p>Reference configuration (not run in the simulator). A <b>pull request</b> (GitHub name) or <b>merge request</b> (GitLab name) is a web page that says "please review my branch and merge it into main". The server provides it; plain Git does not. A typical network-team flow:</p>
<ol>
<li>Create a branch: <code>git checkout -b add-vlan30</code>.</li>
<li>Commit the change and push the branch: <code>git push origin add-vlan30</code>.</li>
<li>Open a pull request on the server. Write what changes, why, and how it was tested.</li>
<li>The CI pipeline runs automatically on the branch (next module).</li>
<li>A teammate reads the diff, comments, and approves.</li>
<li>The branch is merged into <code>main</code>, and the pipeline deploys.</li>
</ol>
<p>Admins usually <b>protect</b> main: nobody can push to it directly, force pushes are blocked, and a merge needs at least one approval plus a green pipeline. This is the Git side of change management.</p>

<h3>What must never go into a repository</h3>
<p>A repository keeps every version forever. If a password, API token or SNMP community string is committed once, it stays in history even after you delete the line. Keep secrets out from the start:</p>
<ul><li>List files that must not be tracked in a file named <code>.gitignore</code> (for example a local file of passwords). Reference configuration (not run in the simulator).</li><li>Store secrets in a vault or in masked CI variables (module on CI/CD), and have the tool read them at run time.</li><li>If a secret is committed by mistake, treat it as leaked: change it on the device first, then clean the history.</li></ul>
<pre class="code"><span class="c"># .gitignore - one pattern per line</span>
secrets.yml
*.bak
backup/</pre>

<div class="eg"><p><b>Worked example.</b> Lab 2, task 5. You finish on main with a clean tree, then run git push origin main. The simulator answers with the range line, and the pushed check passes because main on the remote now equals your main. In real life the server would immediately start the pipeline for that commit.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Committing a file that contains a real password. Pushing straight to main when your team uses pull requests. Using git push --force to "fix" a rejection, which overwrites the commits of your colleagues. Forgetting to pull before starting, then hitting avoidable conflicts.</p></div>
<div class="exam"><p><b>Exam trap.</b> A commit is local; a push sends it to the remote. origin is only a conventional name. Pull equals fetch plus merge. Pull requests are a feature of the hosting service, not of Git itself.</p></div>

<div class="scn"><h4>The token in the history</h4><p>A contractor committed a script that contained a controller API token and pushed it to the company server. A week later he deleted the line and pushed again, believing the problem was gone. A security scan found the token in the earlier commit. The team rotated the token the same hour, then moved to masked CI variables and a pre-merge secret scan.</p><p><b>Lesson:</b> deleting a secret from the latest version does not remove it from history; rotate it.</p></div>
<div class="iv"><p class="q">"What is the source of truth in a network automation workflow, and how do changes reach it?"</p><p>The main branch of the shared repository. Engineers work on branches, push them to the remote, open a pull request, a teammate reviews and the pipeline tests it, and only then is it merged. Automation such as Ansible and CI/CD reads main and pushes it to devices, so the network always matches reviewed, versioned configuration.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>A remote (usually origin) is a shared copy of the repository; git push sends commits to it.</li><li>SSH addresses such as git@git.example:team/netcfg.git avoid typing passwords.</li><li>Tags are fixed labels for known-good commits; branches move.</li><li>Pull requests (merge requests) are a hosting-service review step; protect main so it is the only path.</li><li>Never commit secrets; deleting them later does not erase history.</li></ul></div>

`,hi:`

<p><b>Is chapter ki ek idea:</b> ab tak sab kuch ek computer par tha. <b>Remote</b> repository ki woh copy hai jo shared server par hoti hai. Push karne se aapke commits wahan pahunchte hain taaki team aur automation tools unhe use kar sakein.</p>
<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Change aapke laptop se main tak review gate se guzarta hai."><rect x="10" y="28" width="128" height="68" rx="10" fill="#bae6fd"/><text x="74" y="58" text-anchor="middle" class="svg-ink" font-size="14">Aapki branch</text><text x="74" y="78" text-anchor="middle" class="svg-muted" font-size="12">local commits</text><line x1="138" y1="62" x2="168" y2="62" stroke="#64748b" stroke-width="2"/><polygon points="168,57 174,62 168,67" fill="#64748b"/><text x="156" y="50" text-anchor="middle" class="svg-accent" font-size="11">push</text><rect x="174" y="28" width="128" height="68" rx="10" fill="#bbf7d0"/><text x="238" y="58" text-anchor="middle" class="svg-ink" font-size="14">Remote</text><text x="238" y="78" text-anchor="middle" class="svg-muted" font-size="12">shared server</text><line x1="302" y1="62" x2="332" y2="62" stroke="#64748b" stroke-width="2"/><polygon points="332,57 338,62 332,67" fill="#64748b"/><rect x="338" y="28" width="128" height="68" rx="10" fill="#fde68a"/><text x="402" y="58" text-anchor="middle" class="svg-ink" font-size="14">Pull request</text><text x="402" y="78" text-anchor="middle" class="svg-muted" font-size="12">review + approve</text><line x1="466" y1="62" x2="496" y2="62" stroke="#64748b" stroke-width="2"/><polygon points="496,57 502,62 496,67" fill="#64748b"/><text x="484" y="50" text-anchor="middle" class="svg-accent" font-size="11">merge</text><rect x="502" y="28" width="128" height="68" rx="10" fill="#ddd6fe"/><text x="566" y="58" text-anchor="middle" class="svg-ink" font-size="14">main</text><text x="566" y="78" text-anchor="middle" class="svg-muted" font-size="12">source of truth</text></svg><p class="cap">A change travels from your laptop to main through a review gate.</p></div>

<h3>Remote aur origin</h3>
<p>Remote repository ki doosri copy ka ek naam wala link hai, aam taur par GitLab, GitHub ya company ke Git server par. Aam naam <code>origin</code> hai. Address ya to HTTPS address hota hai ya <b>SSH address</b> jaise <code>git@git.example:team/netcfg.git</code>, jiska matlab "user git, host git.example par, repository team/netcfg". SSH addresses key pairs use karte hain, isliye koi password type ya script mein store nahi hota.</p>
<pre class="code">git remote add origin git@git.example:team/netcfg.git
git remote -v
git push origin main</pre>
<pre class="out">origin	git@git.example:team/netcfg.git (fetch)
origin	git@git.example:team/netcfg.git (push)

To git@git.example:team/netcfg.git
   * [new branch]  main -&gt; main</pre>
<p><code>git remote add</code> sirf link record karta hai. <code>git remote -v</code> use do baar list karta hai, ek fetch (download) ke liye aur ek push (upload) ke liye. <code>git push origin main</code> aapki local <code>main</code> ke commits remote ki usi naam ki <code>main</code> branch par bhejta hai. <code>[new branch]</code> matlab server ke paas yeh branch pehle nahi thi. Feature branch push karna bhi waisa hi hai: <code>git push origin add-vlan30</code>.</p>
<p>Lab 2 mein doosra push range dikhata hai:</p>
<pre class="out">   faf4702..429f01a  main -&gt; main</pre>
<p>Iska matlab "remote main commit faf4702 se commit 429f01a par pahunch gayi". (Asli output ek <code>To</code> line se shuru hota hai jo remote ka naam batati hai.)</p>

<h3>Tags: ek lamhe ke permanent naam</h3>
<p><b>Tag</b> ek commit par laga fixed label hai, release ya known-good baseline ke liye, jaise quarter ke liye approved configuration.</p>
<pre class="code">git tag before-change
git tag</pre>
<pre class="out">before-change</pre>
<p>Branch label har commit ke saath aage badhta hai; tag wahin rehta hai jahan aapne lagaya. Agar mahino baad koi change galat ho, to tag batata hai ki approved baseline exactly kaun sa commit tha.</p>

<h3>Remote ka doosra hissa: clone, fetch, pull</h3>
<p>Reference configuration (not run in the simulator). Simulator host un files se shuru hota hai jo aapke paas pehle se hain aur sirf push karta hai. Asli laptop par aap yeh bhi use karte:</p>
<pre class="code">git clone git@git.example:team/netcfg.git    <span class="c"># remote repo ki pehli baar copy</span>
git fetch origin                              <span class="c"># naye commits download, local kuch nahi badalta</span>
git pull origin main                          <span class="c"># fetch, phir apni branch mein merge</span></pre>
<p><code>clone</code> poori repository aapki machine par copy karta hai. <code>fetch</code> doosron ka push kiya hua download karta hai bina aapki files chhoo. <code>pull</code> fetch plus merge hai. Kaam shuru karne se pehle pull karo, taaki latest main par build karo. Agar server par naye commits hon aur aap push karo, to server push ko <b>reject</b> karta hai, message jaise <i>rejected, fetch first</i>. Ilaaj hai pull (ya fetch aur merge), chapter 5 jaisa conflict resolve karo, phir dobara push. Colleagues ke kaam par push force mat karo.</p>

<h3>Pull requests (merge requests)</h3>
<p>Reference configuration (not run in the simulator). <b>Pull request</b> (GitHub ka naam) ya <b>merge request</b> (GitLab ka naam) ek web page hai jo kehta hai "meri branch review karke main mein merge karo". Yeh server deta hai; plain Git nahi. Network team ka typical flow:</p>
<ol>
<li>Branch banao: <code>git checkout -b add-vlan30</code>.</li>
<li>Change commit karo aur branch push karo: <code>git push origin add-vlan30</code>.</li>
<li>Server par pull request kholo. Likho kya badal raha hai, kyun, aur kaise test hua.</li>
<li>CI pipeline branch par apne aap chalti hai (agla module).</li>
<li>Teammate diff padhta hai, comments deta hai, aur approve karta hai.</li>
<li>Branch <code>main</code> mein merge hoti hai, aur pipeline deploy karti hai.</li>
</ol>
<p>Admins aam taur par main ko <b>protect</b> karte hain: koi seedha push nahi kar sakta, force push block hota hai, aur merge ke liye kam se kam ek approval plus green pipeline chahiye. Yeh change management ka Git wala hissa hai.</p>

<h3>Repository mein kya kabhi nahi jaana chahiye</h3>
<p>Repository har version hamesha rakhti hai. Agar password, API token ya SNMP community string ek baar commit ho gaya, to line delete karne ke baad bhi history mein rehta hai. Secrets ko shuru se bahar rakho:</p>
<ul><li>Jo files track nahi honi chahiye unhe <code>.gitignore</code> naam ki file mein likho (jaise passwords ki local file). Reference configuration (not run in the simulator).</li><li>Secrets ko vault ya masked CI variables mein rakho (CI/CD module), aur tool unhe run time par padhe.</li><li>Agar galti se secret commit ho gaya, to use leaked samjho: pehle device par badlo, phir history saaf karo.</li></ul>
<pre class="code"><span class="c"># .gitignore - ek line mein ek pattern</span>
secrets.yml
*.bak
backup/</pre>

<div class="eg"><p><b>Worked example.</b> Lab 2, task 5. Aap main par clean tree ke saath khatam karte ho, phir git push origin main chalate ho. Simulator range line se jawab deta hai, aur pushed check pass hota hai kyunki remote par main ab aapki main ke barabar hai. Asli zindagi mein server turant us commit ke liye pipeline shuru kar deta.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Asli password wali file commit kar dena. Jab team pull requests use karti hai tab seedha main par push karna. Rejection "theek karne" ke liye git push --force use karna, jo doosron ke commits overwrite karta hai. Shuru karne se pehle pull bhool jaana aur phir avoidable conflicts mein phasna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Commit local hai; push use remote par bhejta hai. origin sirf conventional naam hai. Pull barabar fetch plus merge. Pull requests hosting service ka feature hain, Git ka nahi.</p></div>

<div class="scn"><h4>History mein token</h4><p>Ek contractor ne controller API token wali script commit karke company server par push kar di. Ek hafte baad usne line delete karke dobara push kiya aur samjha ki masla khatam. Security scan ko token pehle wale commit mein mila. Team ne usi ghante token rotate kiya, phir masked CI variables aur pre-merge secret scan par shift hui.</p><p><b>Lesson:</b> latest version se secret delete karne se woh history se nahi hatta; use rotate karo.</p></div>
<div class="iv"><p class="q">"Network automation workflow mein source of truth kya hai aur changes wahan kaise pahunchte hain?"</p><p>Shared repository ki main branch. Engineers branches par kaam karte hain, unhe remote par push karte hain, pull request kholte hain, teammate review karta hai aur pipeline test karti hai, aur tabhi merge hota hai. Ansible aur CI/CD jaise automation main padhte hain aur devices par push karte hain, isliye network hamesha reviewed, versioned configuration se match karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>Remote (aam taur par origin) repository ki shared copy hai; git push commits use bhejta hai.</li><li>git@git.example:team/netcfg.git jaise SSH addresses password type karne se bachate hain.</li><li>Tags known-good commits ke fixed labels hain; branches aage badhti hain.</li><li>Pull requests (merge requests) hosting-service ka review step hain; main ko protect karo taaki wahi ek raasta ho.</li><li>Secrets kabhi commit mat karo; baad mein delete karne se history saaf nahi hoti.</li></ul></div>

`}};export{e as default};