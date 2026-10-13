var e={id:`environments-config`,h:{en:`Environments and configuration through environment variables`,hi:`Environments aur environment variables se configuration`},body:{en:`
<p>A school does not let a new teacher take the final exam class on day one. First the teacher practises alone (rehearsal), then teaches a small trial class, then a full mock class watched by the principal, and only then the real class. Software goes through the same ladder. Each step is an <b>environment</b>: a complete place where the app runs, with its own servers, data and settings.</p>

<h3>The four usual environments</h3>
<table class="cmp"><tr><th>Environment</th><th>Purpose</th><th>Who uses it</th><th>Data</th></tr>
<tr><td>Development (dev)</td><td>Write and try code; breaks often.</td><td>One developer or a small team</td><td>Fake or tiny sample data</td></tr>
<tr><td>Test (QA, CI)</td><td>Automatic and manual tests after each change.</td><td>The pipeline and testers</td><td>Generated test data, reset often</td></tr>
<tr><td>Staging (pre-prod)</td><td>A <b>rehearsal of production</b>: same versions, same size of settings, final checks.</td><td>Release team, stakeholders</td><td>Copy of production shape, masked of real secrets or personal data</td></tr>
<tr><td>Production (prod)</td><td>The live service real users depend on.</td><td>Customers, other systems</td><td>Real data</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Promotion of one artifact through four environments">
<rect x="10" y="40" width="130" height="60" rx="8" fill="#bae6fd"/><text x="75" y="66" text-anchor="middle" class="svg-ink" font-size="13">Dev</text><text x="75" y="86" text-anchor="middle" class="svg-muted" font-size="11">DB_HOST = dev-db</text>
<rect x="175" y="40" width="130" height="60" rx="8" fill="#ddd6fe"/><text x="240" y="66" text-anchor="middle" class="svg-ink" font-size="13">Test</text><text x="240" y="86" text-anchor="middle" class="svg-muted" font-size="11">DB_HOST = test-db</text>
<rect x="340" y="40" width="130" height="60" rx="8" fill="#fde68a"/><text x="405" y="66" text-anchor="middle" class="svg-ink" font-size="13">Staging</text><text x="405" y="86" text-anchor="middle" class="svg-muted" font-size="11">DB_HOST = stg-db</text>
<rect x="505" y="40" width="125" height="60" rx="8" fill="#bbf7d0"/><text x="567" y="66" text-anchor="middle" class="svg-ink" font-size="13">Prod</text><text x="567" y="86" text-anchor="middle" class="svg-muted" font-size="11">DB_HOST = prod-db</text>
<line x1="140" y1="70" x2="175" y2="70" stroke="#64748b" stroke-width="2"/><line x1="305" y1="70" x2="340" y2="70" stroke="#64748b" stroke-width="2"/><line x1="470" y1="70" x2="505" y2="70" stroke="#64748b" stroke-width="2"/>
<text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="12">The SAME image moves right; only the environment variables change</text>
</svg><p class="cap">Promote one build; never rebuild per environment.</p></div>

<h3>Why configuration must be separate from code</h3>
<p>The database address, the controller URL and the API token are different in every environment. If they sit inside the code, you must change code (and rebuild) to move from test to prod, and the rebuilt thing is no longer the thing you tested. The 12-factor answer is: build <b>once</b>, and give each environment its settings from outside, as <b>environment variables</b>. An environment variable is a name and value that the operating system hands to a process when it starts.</p>
<pre class="code"><span class="c"># Shell: set variables for one command</span>
export CONTROLLER_ADDR=198.51.100.20
export POLL_SECONDS=60
python3 poller.py

<span class="c"># Python: read them</span>
import os
addr = os.environ["CONTROLLER_ADDR"]               <span class="c"># required, KeyError if absent</span>
secs = int(os.environ.get("POLL_SECONDS", "30"))   <span class="c"># optional with a default</span>

<span class="c"># Docker: pass them in when starting the container</span>
docker run -d --name poller -e CONTROLLER_ADDR=198.51.100.20 -e POLL_SECONDS=60 nk/poller:1.4
docker run -d --name poller --env-file prod.env nk/poller:1.4</pre>
<pre class="out">$ docker exec poller env | grep -E "CONTROLLER|POLL"
<span class="hl">CONTROLLER_ADDR=198.51.100.20</span>
POLL_SECONDS=60</pre>

<h3>Good habits</h3>
<ul>
<li><b>Required versus optional.</b> Required settings should fail at start-up with a clear message; optional ones get safe defaults. A missing variable should never produce a half-working app.</li>
<li><b>Secrets are config too, but sensitive.</b> Tokens and passwords come from a secret store or the pipeline's protected variables, never from Git. An <code>.env</code> file is fine for a laptop, but must be listed in <code>.gitignore</code>.</li>
<li><b>Names, not meanings.</b> Use clear names like <code>DB_HOST</code> and <code>LOG_LEVEL</code>. Values are always strings, so convert numbers and booleans yourself.</li>
<li><b>Keep environments alike.</b> Same image, same database engine, same ports. Differences should be values (addresses, sizes), not behaviour.</li>
<li><b>One variable per setting.</b> Do not hide logic in one giant string.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> The backup tool needs a controller address and a retention period. In dev: <code>CONTROLLER_ADDR=192.0.2.10</code> (a simulator), <code>KEEP_DAYS=1</code>. In prod: <code>CONTROLLER_ADDR=198.51.100.20</code>, <code>KEEP_DAYS=30</code>. The image is identical, tagged <code>1.4</code>. If the prod run misbehaves, you compare only the two small sets of values, not two builds.</p></div>

<div class="warn"><p><b>Common mistakes:</b> committing a <code>.env</code> with real tokens; setting a variable in your own shell and forgetting that the container does not inherit it (you must pass it with <code>-e</code> or <code>--env-file</code>); treating <code>"false"</code> as false in Python (any non-empty string is true).</p></div>
<div class="exam"><p><b>Exam trap:</b> the environment order is dev, test, staging, prod, and staging is the <b>closest copy of production</b>. Config goes in environment variables, not in the image.</p></div>

<div class="scn"><h4>Testing against production</h4><p>A junior engineer in Jaipur ran a "cleanup" script from his laptop. The script had the production controller address as a default value, so it deleted real VLAN templates. The team removed the default, made the variable required, and added a banner that prints the target environment before any write.</p><p><b>Lesson:</b> no default should ever point at production. Make dangerous settings explicit, required and visible.</p></div>

<div class="iv"><p class="q">"How do you handle different settings for dev, staging and production?"</p><p>One build, promoted through environments, with settings injected as environment variables or from a secret store. Mention staging parity, never hard-coding secrets, and that you can reproduce any environment by combining an image tag with its settings.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Environments: dev, test, staging (rehearsal of prod), prod.</li>
<li>Build once; promote the same artifact; vary only configuration.</li>
<li>Config is read from environment variables (<code>os.environ</code>); pass them to containers with <code>-e</code> or <code>--env-file</code>.</li>
<li>Secrets stay out of Git and out of images.</li>
<li>Fail fast on missing required settings.</li>
</ul></div>
`,hi:`
<p>School naya teacher ko pehle din final exam wali class nahi deta. Pehle teacher akela practice karta hai (rehearsal), phir chhoti trial class padhata hai, phir principal ke saamne full mock class, aur tab jaakar asli class. Software bhi isi seedhi se guzarta hai. Har step ek <b>environment</b> hai: ek poori jagah jahan app chalti hai, apne servers, data aur settings ke saath.</p>

<h3>Chaar aam environments</h3>
<table class="cmp"><tr><th>Environment</th><th>Maksad</th><th>Kaun use karta hai</th><th>Data</th></tr>
<tr><td>Development (dev)</td><td>Code likho aur try karo; aksar toot-ta hai.</td><td>Ek developer ya chhoti team</td><td>Fake ya chhota sample data</td></tr>
<tr><td>Test (QA, CI)</td><td>Har change ke baad automatic aur manual tests.</td><td>Pipeline aur testers</td><td>Generated test data, aksar reset</td></tr>
<tr><td>Staging (pre-prod)</td><td>Production ka <b>rehearsal</b>: same versions, same size ki settings, aakhri checks.</td><td>Release team, stakeholders</td><td>Production jaisa shape, asli secrets ya personal data masked</td></tr>
<tr><td>Production (prod)</td><td>Live service jis par asli users depend karte hain.</td><td>Customers, doosre systems</td><td>Asli data</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Ek artifact ka chaar environments mein promotion">
<rect x="10" y="40" width="130" height="60" rx="8" fill="#bae6fd"/><text x="75" y="66" text-anchor="middle" class="svg-ink" font-size="13">Dev</text><text x="75" y="86" text-anchor="middle" class="svg-muted" font-size="11">DB_HOST = dev-db</text>
<rect x="175" y="40" width="130" height="60" rx="8" fill="#ddd6fe"/><text x="240" y="66" text-anchor="middle" class="svg-ink" font-size="13">Test</text><text x="240" y="86" text-anchor="middle" class="svg-muted" font-size="11">DB_HOST = test-db</text>
<rect x="340" y="40" width="130" height="60" rx="8" fill="#fde68a"/><text x="405" y="66" text-anchor="middle" class="svg-ink" font-size="13">Staging</text><text x="405" y="86" text-anchor="middle" class="svg-muted" font-size="11">DB_HOST = stg-db</text>
<rect x="505" y="40" width="125" height="60" rx="8" fill="#bbf7d0"/><text x="567" y="66" text-anchor="middle" class="svg-ink" font-size="13">Prod</text><text x="567" y="86" text-anchor="middle" class="svg-muted" font-size="11">DB_HOST = prod-db</text>
<line x1="140" y1="70" x2="175" y2="70" stroke="#64748b" stroke-width="2"/><line x1="305" y1="70" x2="340" y2="70" stroke="#64748b" stroke-width="2"/><line x1="470" y1="70" x2="505" y2="70" stroke="#64748b" stroke-width="2"/>
<text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="12">SAME image aage badhti hai; sirf environment variables badalte hain</text>
</svg><p class="cap">Ek build promote karo; har environment ke liye rebuild kabhi nahi.</p></div>

<h3>Configuration code se alag kyun hona chahiye</h3>
<p>Database address, controller URL aur API token har environment mein alag hote hain. Agar woh code ke andar hain to test se prod jaane ke liye code badalna (aur rebuild karna) padega, aur rebuild hui cheez woh nahi rehti jo aapne test ki thi. 12-factor ka jawab: <b>ek baar</b> build karo, aur har environment ko uski settings bahar se do, <b>environment variables</b> ke roop mein. Environment variable ek naam aur value hai jo operating system process ko start hote waqt deta hai.</p>
<pre class="code"><span class="c"># Shell: ek command ke liye variables set karo</span>
export CONTROLLER_ADDR=198.51.100.20
export POLL_SECONDS=60
python3 poller.py

<span class="c"># Python: unhe padho</span>
import os
addr = os.environ["CONTROLLER_ADDR"]               <span class="c"># required, na ho to KeyError</span>
secs = int(os.environ.get("POLL_SECONDS", "30"))   <span class="c"># optional, default ke saath</span>

<span class="c"># Docker: container start karte waqt pass karo</span>
docker run -d --name poller -e CONTROLLER_ADDR=198.51.100.20 -e POLL_SECONDS=60 nk/poller:1.4
docker run -d --name poller --env-file prod.env nk/poller:1.4</pre>
<pre class="out">$ docker exec poller env | grep -E "CONTROLLER|POLL"
<span class="hl">CONTROLLER_ADDR=198.51.100.20</span>
POLL_SECONDS=60</pre>

<h3>Achhi aadatein</h3>
<ul>
<li><b>Required versus optional.</b> Required settings start-up par saaf message ke saath fail honi chahiye; optional ko safe defaults milte hain. Missing variable se aadhi-chalti app kabhi nahi banni chahiye.</li>
<li><b>Secrets bhi config hain, lekin sensitive.</b> Tokens aur passwords secret store ya pipeline ke protected variables se aate hain, Git se kabhi nahi. <code>.env</code> file laptop par theek hai, lekin <code>.gitignore</code> mein honi chahiye.</li>
<li><b>Saaf naam.</b> <code>DB_HOST</code> aur <code>LOG_LEVEL</code> jaise naam rakho. Values hamesha strings hoti hain, isliye numbers aur booleans khud convert karo.</li>
<li><b>Environments ek jaise rakho.</b> Same image, same database engine, same ports. Farq values ka ho (addresses, sizes), behaviour ka nahi.</li>
<li><b>Ek setting, ek variable.</b> Logic ko ek bade string mein mat chhupao.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Backup tool ko controller address aur retention period chahiye. Dev mein: <code>CONTROLLER_ADDR=192.0.2.10</code> (simulator), <code>KEEP_DAYS=1</code>. Prod mein: <code>CONTROLLER_ADDR=198.51.100.20</code>, <code>KEEP_DAYS=30</code>. Image identical, tag <code>1.4</code>. Prod run gadbad kare to aap sirf values ke do chhote sets compare karte ho, do builds nahi.</p></div>

<div class="warn"><p><b>Common mistakes:</b> asli tokens ke saath <code>.env</code> commit karna; apne shell mein variable set karke bhool jaana ki container use inherit nahi karta (<code>-e</code> ya <code>--env-file</code> se pass karna padta hai); Python mein <code>"false"</code> ko false samajhna (koi bhi non-empty string true hoti hai).</p></div>
<div class="exam"><p><b>Exam trap:</b> environment ka order dev, test, staging, prod hai, aur staging <b>production ki sabse nazdeeki copy</b> hai. Config environment variables mein jaati hai, image ke andar nahi.</p></div>

<div class="scn"><h4>Production par testing</h4><p>Jaipur ke ek junior engineer ne laptop se "cleanup" script chalayi. Script mein default value ke roop mein production controller address tha, isliye asli VLAN templates delete ho gaye. Team ne default hataya, variable ko required banaya, aur koi bhi write se pehle target environment print karne wala banner jodha.</p><p><b>Lesson:</b> koi default kabhi production ki taraf point nahi karna chahiye. Khatarnaak settings explicit, required aur visible rakho.</p></div>

<div class="iv"><p class="q">"Dev, staging aur production ke alag settings kaise sambhalte ho?"</p><p>Ek build, environments mein promote hota hai, settings environment variables ya secret store se inject hoti hain. Staging parity, secrets kabhi hard-code nahi, aur yeh ki image tag plus settings milakar koi bhi environment dobara bana sakte ho, yeh batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Environments: dev, test, staging (prod ka rehearsal), prod.</li>
<li>Ek baar build; wahi artifact promote; sirf configuration badlo.</li>
<li>Config environment variables se padhi jaati hai (<code>os.environ</code>); containers ko <code>-e</code> ya <code>--env-file</code> se do.</li>
<li>Secrets Git aur images se bahar.</li>
<li>Required settings missing ho to jaldi fail karo.</li>
</ul></div>
`}};export{e as default};