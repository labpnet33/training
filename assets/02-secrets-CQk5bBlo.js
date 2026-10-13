var e={id:`secrets`,h:{en:`Protecting secrets: never in code, never in Git`,hi:`Secrets ki hifazat: code mein nahi, Git mein nahi`},body:{en:`
<p>A <b>secret</b> is any value that proves who you are or unlocks something: a password, an API token, a private key, a database connection string, a cloud access key. Anyone who holds the value can act as you. That makes secrets the most valuable few bytes in your project, and the most common thing developers lose by accident.</p>

<h3>Analogy: the house key</h3>
<p>You do not paint your door key's shape on the front of the house, and you do not leave a copy in the postbox. A secret written in a source file is exactly that: a key on display for everybody who can see the file, today and in every copy that is ever made.</p>

<h3>Why code and Git are the wrong place</h3>
<ul>
<li><b>Code is shared.</b> Colleagues, contractors, build servers and backups all get a copy. A secret in code is as widely known as the code.</li>
<li><b>Git remembers everything.</b> If a token is committed and then deleted in the next commit, it is still in the history, in every clone and every fork. Removing the line fixes the file, not the leak.</li>
<li><b>Repositories change audience.</b> A private repository is made public, an employee leaves with a clone, a laptop is stolen. Automated scanners look for freshly published keys within minutes.</li>
<li><b>You cannot tell who used it.</b> One shared token in one script gives you no way to tell the nightly backup from an intruder.</li>
</ul>
<div class="warn"><p><b>Common mistake.</b> "I deleted it in the next commit, so it is gone." It is not. A secret that was ever committed, pasted in chat, or printed in a log must be treated as <b>burned</b>: replace (rotate) it. Rewriting history is a clean-up, never the fix.</p></div>

<h3>Where secrets should live</h3>
<table class="cmp"><tr><th>Option</th><th>How it works</th><th>Good for</th><th>Watch out for</th></tr>
<tr><td>Environment variable</td><td>The process reads it with <code>os.environ</code> at start-up</td><td>Scripts, containers, CI jobs</td><td>Visible to anyone who can read the process environment; do not print it</td></tr>
<tr><td>Environment file (.env)</td><td>A file of NAME=value lines loaded into the environment, mode 600, listed in .gitignore</td><td>Local development, small servers</td><td>Never commit it; keep a template <code>.env.example</code> without values</td></tr>
<tr><td>Secret manager (vault)</td><td>A service stores secrets encrypted, hands them out after authentication, logs every read, can issue short-lived values</td><td>Production, teams</td><td>The app still needs one identity to log in; protect that identity</td></tr>
<tr><td>CI/CD secret store</td><td>The pipeline injects masked variables only into the jobs allowed to use them</td><td>Pipelines</td><td>Masking hides the value in logs, it does not protect against a malicious job step</td></tr>
</table>
<p>The pattern is always the same: the <b>code names the secret, the environment supplies it</b>.</p>

<h3>Reading a secret in Python</h3>
<pre class="code"><span class="c"># bad: the value is in the file, and in Git forever</span>
API_TOKEN = "nk-sim-7f3a91c2d4e85b60"

<span class="c"># good: the file only names it</span>
import os
API_TOKEN = os.environ["NK_API_TOKEN"]          <span class="c"># fails loudly if it is missing</span>
BASE = os.environ.get("NK_BASE_URL", "nms.nwk.example")   <span class="c"># non-secret setting with a default</span></pre>
<p>Using <code>os.environ["NAME"]</code> for a secret is deliberate: if the variable is missing the script stops with a clear KeyError instead of running with an empty credential.</p>

<h3>The environment file and Git</h3>
<pre class="code">$ echo 'export NK_API_TOKEN=nk-sim-7f3a91c2d4e85b60' &gt; .env
$ chmod 600 .env                     <span class="c"># owner read/write only</span>
$ echo ".env" &gt;&gt; .gitignore         <span class="c"># Git must never see it</span>
$ source .env                        <span class="c"># load into this shell</span>
$ env | grep -c "^NK_"               <span class="c"># count, do not print the value</span></pre>
<pre class="out">$ ls -l .env
<span class="hl">-rw-------</span>  1 devops devops  75 Sep 29 09:00 .env</pre>
<p>The highlighted permission string is what you check: no group or world bits. Lab 2 makes you do exactly this on a build server.</p>

<h3>Secret managers and rotation</h3>
<p>A secret manager (the exam names the idea, not a product) keeps secrets encrypted, releases them only to an authenticated and authorised caller, writes an audit record for every read, and can hand out <b>short-lived</b> credentials that expire by themselves. <b>Rotation</b> means replacing a secret with a new one on a schedule or the moment it may be exposed. Good rotation is possible only when the secret is used from <i>one place</i> (the environment or manager), because then you change one value instead of hunting through twenty scripts.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Secret flow from a manager to a script">
<rect x="20" y="50" width="150" height="60" rx="8" fill="#ddd6fe"/><text x="95" y="76" text-anchor="middle" class="svg-ink" font-size="13">Secret manager</text><text x="95" y="95" text-anchor="middle" class="svg-muted" font-size="11">encrypted, audited</text>
<rect x="245" y="50" width="150" height="60" rx="8" fill="#bae6fd"/><text x="320" y="76" text-anchor="middle" class="svg-ink" font-size="13">Environment</text><text x="320" y="95" text-anchor="middle" class="svg-muted" font-size="11">NK_API_TOKEN</text>
<rect x="470" y="50" width="150" height="60" rx="8" fill="#bbf7d0"/><text x="545" y="76" text-anchor="middle" class="svg-ink" font-size="13">Script</text><text x="545" y="95" text-anchor="middle" class="svg-muted" font-size="11">os.environ</text>
<line x1="170" y1="80" x2="243" y2="80" stroke="#64748b" stroke-width="2"/><line x1="395" y1="80" x2="468" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">Repository holds names only. Rotate in one place.</text>
</svg><p class="cap">The repository contains the name of the secret; the value arrives at run time.</p></div>

<h3>What to do when a secret leaks</h3>
<ol>
<li><b>Revoke or rotate</b> the credential first, immediately. Everything else can wait ten minutes; the leak cannot.</li>
<li>Find where it was used and check logs for use you do not recognise.</li>
<li>Remove it from the code and move it to the environment or manager.</li>
<li>Add a secret scanner to the pipeline (it checks commits for key-like strings) so the next one is caught before it is pushed.</li>
</ol>
<div class="exam"><p><b>Exam trap.</b> "Base64 encoding hides the secret" is false: Base64 is a reversible format, not protection. Likewise a long, clever variable name does not protect a value that is in the source.</p></div>

<div class="scn"><h4>The token in the old commit</h4><p>An intern at a logistics firm pushed a backup script containing a switch API token. A reviewer spotted it the next morning, the intern deleted the line and pushed again, and everybody relaxed. Three weeks later the security team noticed API calls from an address in another country: an automated scanner had copied the token from the first commit within minutes of the push. The team rotated the token, moved it into a secret store, and enabled push protection that blocks commits containing key patterns.</p><p><b>Lesson:</b> deleting a secret is not rotating it; assume it was copied the moment it left your machine.</p></div>

<div class="iv"><p class="q">"Where should an application get its database password from?"</p><p>From the environment or a secret manager at run time, never from source code or the repository. Say that the code only references the name, the value is injected per environment (dev, test, prod have different ones), access is least-privilege and audited, and the password can be rotated without changing code. Add that a leaked secret is rotated, not just deleted.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Never put secrets in code or Git: Git history keeps them forever, and copies spread.</li>
<li>Read secrets from environment variables or a secret manager; a .env file must be mode 600 and in .gitignore.</li>
<li>Rotate on a schedule and immediately after any exposure; deletion alone does not help.</li>
<li>Base64 is encoding, not protection.</li>
<li>A secret scanner in the pipeline catches mistakes before they are pushed.</li>
</ul></div>
`,hi:`
<p><b>Secret</b> woh koi bhi value hai jo batati hai ki aap kaun ho ya kuch unlock karti hai: password, API token, private key, database connection string, cloud access key. Jiske paas yeh value hai woh aapki tarah act kar sakta hai. Isiliye secrets aapke project ke sabse keemti chhote bytes hain, aur developers inhe sabse zyada galti se kho dete hain.</p>

<h3>Analogy: ghar ki chabi</h3>
<p>Aap apni chabi ka shape ghar ke samne nahi banate, aur uski copy postbox mein nahi chhodte. Source file mein likha secret bilkul wahi hai: har us insaan ke liye display par rakhi chabi jo file dekh sakta hai, aaj aur har copy mein jo kabhi banegi.</p>

<h3>Code aur Git galat jagah kyun hain</h3>
<ul>
<li><b>Code share hota hai.</b> Colleagues, contractors, build servers aur backups sab ko copy milti hai. Code mein secret utna hi mashhoor hai jitna code.</li>
<li><b>Git sab yaad rakhta hai.</b> Agar token commit hua aur agle commit mein delete kiya, to woh history mein, har clone aur fork mein ab bhi hai. Line hatane se file theek hoti hai, leak nahi.</li>
<li><b>Repositories ka audience badalta hai.</b> Private repository public ho jati hai, employee clone leke chala jata hai, laptop chori ho jata hai. Automated scanners naye publish hue keys minutes mein dhoondh lete hain.</li>
<li><b>Pata nahi chalta kisne use kiya.</b> Ek script mein ek shared token se aap nightly backup aur intruder mein farak nahi kar sakte.</li>
</ul>
<div class="warn"><p><b>Common mistake.</b> "Agle commit mein delete kar diya, to gaya." Nahi gaya. Jo secret kabhi commit hua, chat mein paste hua ya log mein print hua, use <b>burned</b> maano: replace (rotate) karo. History rewrite karna clean-up hai, fix nahi.</p></div>

<h3>Secrets kahan rehne chahiye</h3>
<table class="cmp"><tr><th>Option</th><th>Kaise kaam karta hai</th><th>Kiske liye achha</th><th>Dhyan rakho</th></tr>
<tr><td>Environment variable</td><td>Process start par <code>os.environ</code> se padhta hai</td><td>Scripts, containers, CI jobs</td><td>Process environment padh sakne wale ko dikhta hai; print mat karo</td></tr>
<tr><td>Environment file (.env)</td><td>NAME=value lines ki file jo environment mein load hoti hai, mode 600, .gitignore mein</td><td>Local development, chhote servers</td><td>Kabhi commit mat karo; bina values ka template <code>.env.example</code> rakho</td></tr>
<tr><td>Secret manager (vault)</td><td>Service secrets encrypted rakhti hai, authentication ke baad deti hai, har read log karti hai, short-lived values de sakti hai</td><td>Production, teams</td><td>App ko phir bhi login ke liye ek identity chahiye; use protect karo</td></tr>
<tr><td>CI/CD secret store</td><td>Pipeline masked variables sirf allowed jobs mein inject karti hai</td><td>Pipelines</td><td>Masking log mein value chhupati hai, malicious job step se nahi bachati</td></tr>
</table>
<p>Pattern hamesha wahi: <b>code secret ka naam batata hai, environment value deta hai</b>.</p>

<h3>Python mein secret padhna</h3>
<pre class="code"><span class="c"># bad: value file mein hai, aur Git mein hamesha ke liye</span>
API_TOKEN = "nk-sim-7f3a91c2d4e85b60"

<span class="c"># good: file sirf naam batati hai</span>
import os
API_TOKEN = os.environ["NK_API_TOKEN"]          <span class="c"># missing ho to zor se fail hota hai</span>
BASE = os.environ.get("NK_BASE_URL", "nms.nwk.example")   <span class="c"># non-secret setting default ke saath</span></pre>
<p>Secret ke liye <code>os.environ["NAME"]</code> jaan-boojhkar use hota hai: variable missing ho to script saaf KeyError ke saath ruk jati hai, khaali credential ke saath nahi chalti.</p>

<h3>Environment file aur Git</h3>
<pre class="code">$ echo 'export NK_API_TOKEN=nk-sim-7f3a91c2d4e85b60' &gt; .env
$ chmod 600 .env                     <span class="c"># sirf owner read/write</span>
$ echo ".env" &gt;&gt; .gitignore         <span class="c"># Git ko yeh kabhi nahi dikhni chahiye</span>
$ source .env                        <span class="c"># is shell mein load</span>
$ env | grep -c "^NK_"               <span class="c"># ginti karo, value print mat karo</span></pre>
<pre class="out">$ ls -l .env
<span class="hl">-rw-------</span>  1 devops devops  75 Sep 29 09:00 .env</pre>
<p>Highlighted permission string woh hai jo aap check karte ho: group ya world bits nahi. Lab 2 mein aap build server par bilkul yahi karte ho.</p>

<h3>Secret managers aur rotation</h3>
<p>Secret manager (exam idea batata hai, product nahi) secrets encrypted rakhta hai, sirf authenticated aur authorised caller ko deta hai, har read ka audit record likhta hai, aur <b>short-lived</b> credentials de sakta hai jo khud expire ho jaate hain. <b>Rotation</b> ka matlab secret ko schedule par ya jaise hi exposure ka shak ho naye se badalna. Achhi rotation tabhi mumkin hai jab secret <i>ek jagah</i> se use ho (environment ya manager), kyunki tab aap bees scripts mein dhoondhne ki jagah ek value badalte ho.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Manager se script tak secret flow">
<rect x="20" y="50" width="150" height="60" rx="8" fill="#ddd6fe"/><text x="95" y="76" text-anchor="middle" class="svg-ink" font-size="13">Secret manager</text><text x="95" y="95" text-anchor="middle" class="svg-muted" font-size="11">encrypted, audited</text>
<rect x="245" y="50" width="150" height="60" rx="8" fill="#bae6fd"/><text x="320" y="76" text-anchor="middle" class="svg-ink" font-size="13">Environment</text><text x="320" y="95" text-anchor="middle" class="svg-muted" font-size="11">NK_API_TOKEN</text>
<rect x="470" y="50" width="150" height="60" rx="8" fill="#bbf7d0"/><text x="545" y="76" text-anchor="middle" class="svg-ink" font-size="13">Script</text><text x="545" y="95" text-anchor="middle" class="svg-muted" font-size="11">os.environ</text>
<line x1="170" y1="80" x2="243" y2="80" stroke="#64748b" stroke-width="2"/><line x1="395" y1="80" x2="468" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">Repository mein sirf naam. Rotation ek jagah.</text>
</svg><p class="cap">Repository mein secret ka naam hota hai; value run time par aati hai.</p></div>

<h3>Secret leak ho jaye to kya karein</h3>
<ol>
<li>Credential ko pehle <b>revoke ya rotate</b> karo, turant. Baaki sab das minute ruk sakta hai; leak nahi.</li>
<li>Dhoondho kahan use hua tha aur logs mein aisa use dekho jo aap pehchante nahi.</li>
<li>Use code se hatao aur environment ya manager mein daalo.</li>
<li>Pipeline mein secret scanner lagao (woh commits mein key jaisi strings check karta hai) taaki agla push se pehle pakda jaye.</li>
</ol>
<div class="exam"><p><b>Exam trap.</b> "Base64 encoding secret chhupa deti hai" galat hai: Base64 reversible format hai, protection nahi. Waise hi lamba, clever variable name us value ko protect nahi karta jo source mein hai.</p></div>

<div class="scn"><h4>Purane commit mein token</h4><p>Ek logistics firm ke intern ne switch API token wali backup script push kar di. Reviewer ne agli subah dekha, intern ne line delete karke dobara push kiya, aur sab nishchint ho gaye. Teen hafte baad security team ne dusre desh ke address se API calls dekhi: ek automated scanner ne push ke minutes mein pehle commit se token copy kar liya tha. Team ne token rotate kiya, secret store mein daala, aur push protection on kiya jo key patterns wale commits block karta hai.</p><p><b>Lesson:</b> secret delete karna rotate karna nahi hai; maan lo ki jis pal woh aapki machine se nikla, copy ho gaya.</p></div>

<div class="iv"><p class="q">"Application ko database password kahan se milna chahiye?"</p><p>Run time par environment ya secret manager se, kabhi source code ya repository se nahi. Batao ki code sirf naam refer karta hai, value har environment (dev, test, prod) ke liye alag inject hoti hai, access least-privilege aur audited hai, aur password code badle bina rotate ho sakta hai. Jodo ki leaked secret rotate hota hai, sirf delete nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Secrets kabhi code ya Git mein nahi: Git history unhe hamesha rakhti hai, aur copies phail jaati hain.</li>
<li>Secrets environment variables ya secret manager se padho; .env file mode 600 aur .gitignore mein honi chahiye.</li>
<li>Schedule par aur kisi bhi exposure ke turant baad rotate karo; sirf delete se kuch nahi hota.</li>
<li>Base64 encoding hai, protection nahi.</li>
<li>Pipeline mein secret scanner galtiyan push se pehle pakadta hai.</li>
</ul></div>
`}};export{e as default};