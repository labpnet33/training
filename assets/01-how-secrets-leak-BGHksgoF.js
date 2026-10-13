var e={id:`how-secrets-leak`,h:{en:`How secrets leak: what you will learn and the big picture`,hi:`Secrets kaise leak hote hain: kya seekhoge aur badi tasveer`},body:{en:`
<p><b>The idea of this chapter:</b> every script that logs in to a router needs a password. The password is a <b>secret</b>: a value that must stay known to the people and programs allowed to use it, and to nobody else. Most network engineers do not lose secrets to clever attackers. They lose them to their own habits: a password typed into a script, printed into a log, left in a file everybody can read. This module teaches the habits that close those doors.</p>

<h3>What you will learn</h3>
<ul>
<li>Find hard-coded passwords with <code>grep</code>, and explain why deleting a password from a file that is already in Git history is not enough.</li>
<li>Move credentials into environment variables with <code>os.environ</code>, and into a <code>.env</code> file loaded by <code>python-dotenv</code> and ignored by Git.</li>
<li>Protect a secret file with <code>chmod 600</code> and check the mode from Python with <code>os.stat</code>.</li>
<li>Ask a person for a password with <code>getpass</code> so nothing appears on the screen.</li>
<li>Keep secrets out of logs, and mask <code>secret</code> and <code>password</code> lines of a configuration before it goes into a ticket.</li>
<li>Store passwords as salted, slow hashes (<code>pbkdf2_hmac</code>), and explain why plain <code>sha256</code> is the wrong tool.</li>
<li>Fingerprint backups with <code>sha256</code> so a later edit is caught, then troubleshoot four leaks in a helper tool.</li>
</ul>

<h3>Prerequisites</h3>
<p>You should have finished <code>auto-py-basics</code>, <code>auto-py-data</code> and <code>auto-py-func</code> (variables, dictionaries, loops, functions, files and <code>try</code>/<code>except</code>), <code>auto-ssh</code> (the <code>nkmiko</code> backup script), <code>auto-git</code> (commits and history) and <code>py-tools</code> (<code>argparse</code>, <code>logging</code>, exit codes and cron). You also need the Linux shell basics from <code>lx-shell</code>: <code>ls -l</code>, <code>cat</code>, <code>grep</code>, <code>chmod</code>. This module does not repeat them; it uses them.</p>

<h3>Analogy: the key under the doormat</h3>
<p>Imagine you hide your house key under the doormat. It is convenient: you never forget it. But the doormat is a public place. The postman, the neighbour and a stranger who read about "keys under doormats" all know where to look. A password inside a script is that key. The script does not stay at home. It is copied to a colleague, pasted into a chat, committed to Git, attached to a ticket. Every copy carries the key, and you cannot take the copies back.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="One script and the four places its password can leak">
<rect x="10" y="80" width="130" height="70" rx="10" fill="#fde68a"/><text x="75" y="108" text-anchor="middle" class="svg-ink" font-size="13">backup.py</text><text x="75" y="128" text-anchor="middle" class="svg-muted" font-size="11">PASSWORD = ...</text>
<rect x="250" y="10" width="190" height="42" rx="8" fill="#fecaca"/><text x="345" y="36" text-anchor="middle" class="svg-ink" font-size="12">1 source code</text>
<rect x="250" y="66" width="190" height="42" rx="8" fill="#fecaca"/><text x="345" y="92" text-anchor="middle" class="svg-ink" font-size="12">2 log files</text>
<rect x="250" y="122" width="190" height="42" rx="8" fill="#fecaca"/><text x="345" y="148" text-anchor="middle" class="svg-ink" font-size="12">3 readable files</text>
<rect x="250" y="178" width="190" height="42" rx="8" fill="#fecaca"/><text x="345" y="204" text-anchor="middle" class="svg-ink" font-size="12">4 weak stored hashes</text>
<text x="540" y="36" text-anchor="middle" class="svg-muted" font-size="11">Git, chat, tickets</text>
<text x="540" y="92" text-anchor="middle" class="svg-muted" font-size="11">support, SIEM</text>
<text x="540" y="148" text-anchor="middle" class="svg-muted" font-size="11">other users</text>
<text x="540" y="204" text-anchor="middle" class="svg-muted" font-size="11">stolen user file</text>
<line x1="140" y1="105" x2="250" y2="31" stroke="#64748b" stroke-width="2"/><line x1="140" y1="112" x2="250" y2="87" stroke="#64748b" stroke-width="2"/><line x1="140" y1="120" x2="250" y2="143" stroke="#64748b" stroke-width="2"/><line x1="140" y1="128" x2="250" y2="199" stroke="#64748b" stroke-width="2"/>
<line x1="440" y1="31" x2="480" y2="31" stroke="#64748b" stroke-width="2"/><line x1="440" y1="87" x2="480" y2="87" stroke="#64748b" stroke-width="2"/><line x1="440" y1="143" x2="480" y2="143" stroke="#64748b" stroke-width="2"/><line x1="440" y1="199" x2="480" y2="199" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">One password, four doors. This module closes each of them.</p></div>

<h3>The four doors, and one more promise</h3>
<table class="cmp"><tr><th>Door</th><th>How it happens</th><th>The habit that closes it</th></tr>
<tr><td>1 Source code</td><td><code>PASSWORD = "NK@2026"</code> typed into the script</td><td>Environment variable or <code>.env</code> file, kept out of Git</td></tr>
<tr><td>2 Logs and output</td><td><code>logging.info("... password=%s", password)</code>, or a raw config pasted into a ticket</td><td>Never log secrets; mask <code>secret</code> and <code>password</code> lines</td></tr>
<tr><td>3 Readable files</td><td><code>.env</code> created with the default mode, readable by every user</td><td><code>chmod 600</code> and a check in code</td></tr>
<tr><td>4 Stored passwords</td><td>A fast, unsalted hash such as plain <code>sha256</code></td><td>Salt plus <code>pbkdf2_hmac</code> with many iterations</td></tr>
</table>
<p>The fifth topic is a promise instead of a door: <b>integrity</b>. A sha256 fingerprint of every backup lets you prove later that nobody edited a saved configuration.</p>

<h3>The two labs of this module</h3>
<p>In <b>Lab 1 (Take the password out of the scripts)</b> you work on the host <code>AUTO01</code> (user <code>netadmin</code>) with two routers, R1 and R2 (<code>netops</code> / <code>NK@2026</code>). The company, Kaveri Foods, will move its scripts into Git next week, and <code>backup.py</code> and <code>audit.py</code> both have the router password typed in. You will find the leak, move it to the environment, then to a protected <code>.env</code> file, switch one script to <code>getpass</code>, and seal the backups with <code>seal.py</code>. In <b>Lab 2 (Four leaks in guard.py)</b> a helper tool runs without a single error and still leaks four ways; you find each leak from its symptom and fix it with <code>sed</code>.</p>

<div class="note"><p><b>Defensive voice.</b> This module is about protecting your own secrets. It never shows how to steal or crack someone else's. The passwords in the labs, such as <code>NK@2026</code>, are lab values only. Never reuse a lab password anywhere real.</p></div>

<div class="eg"><p><b>Worked example.</b> A backup script has been running for two years. Count the copies of its password: the script on the server, a copy on the engineer's laptop, one in the team chat from the day it was shared, one in a ticket, and one in a Git commit from last month. Five copies means five places to clean and one password to change. The lesson: prevention is cheap, cleaning is expensive.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Thinking "the repository is private, so it is safe" (private repositories get shared, cloned and breached). Believing a secret is safe because the script is "only on our server". Using one shared password for every router and every script, so one leak opens everything.</p></div>
<div class="exam"><p><b>Exam trap.</b> A secret is not protected by being <i>hard to find</i>. Obscurity is not security. Splitting a password into two strings or writing it in base64 inside the script protects nothing.</p></div>

<div class="scn"><h4>The password in the chat</h4><p>A new engineer asked how the nightly backup logs in. A colleague pasted the whole <code>backup.py</code> into the team chat. Three months later the chat export was shared with a contractor. The password had to be changed on forty routers in one weekend.</p><p><b>Lesson:</b> a secret that lives in a script travels with the script; a secret that lives in the environment stays on the machine.</p></div>

<div class="iv"><p class="q">"Why should credentials not be hard-coded in a script?"</p><p>Scripts are copied, committed to Git, pasted in chats and attached to tickets, so a hard-coded password spreads to every copy and stays in version history. Credentials belong in environment variables, a protected file outside version control, or a secrets manager, and they should be easy to rotate.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A secret leaks through four doors: source code, logs, readable files and weak stored hashes.</li>
<li>Integrity is the fifth topic: sha256 fingerprints prove a backup was not edited.</li>
<li>Prevention is cheap; cleaning copies is expensive.</li>
<li>Lab 1 fixes the scripts; Lab 2 hunts four leaks in guard.py.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> router mein login karne wali har script ko password chahiye. Password ek <b>secret</b> hai: aisi value jo sirf unhi logon aur programs ko pata honi chahiye jinhe use karne ki ijazat hai, aur kisi ko nahi. Zyada tar network engineers secrets chalaak attackers ko nahi, apni aadaton ki wajah se kho dete hain: script mein password type kar diya, log mein print ho gaya, aisi file mein chhod diya jo sab padh sakte hain. Yeh module un darwaazon ko band karne ki aadatein sikhata hai.</p>

<h3>Aap kya seekhoge</h3>
<ul>
<li><code>grep</code> se hard-coded passwords dhoondhna, aur batana ki jo password Git history mein pehle se hai use file se delete karna kaafi kyon nahi.</li>
<li>Credentials ko <code>os.environ</code> se environment variables mein, aur <code>python-dotenv</code> se load hone wali aur Git se ignore hone wali <code>.env</code> file mein le jaana.</li>
<li>Secret file ko <code>chmod 600</code> se protect karna aur <code>os.stat</code> se Python ke andar mode check karna.</li>
<li><code>getpass</code> se insaan se password maangna taaki screen par kuch na dikhe.</li>
<li>Secrets ko logs se bahar rakhna, aur configuration ticket mein jaane se pehle <code>secret</code> aur <code>password</code> lines mask karna.</li>
<li>Passwords ko salt wale, slow hashes (<code>pbkdf2_hmac</code>) ke roop mein store karna, aur batana ki plain <code>sha256</code> galat tool kyon hai.</li>
<li>Backups ka <code>sha256</code> fingerprint banana taaki baad ka edit pakda jaye, phir ek helper tool ke chaar leaks troubleshoot karna.</li>
</ul>

<h3>Prerequisites</h3>
<p>Aapne <code>auto-py-basics</code>, <code>auto-py-data</code> aur <code>auto-py-func</code> (variables, dictionaries, loops, functions, files aur <code>try</code>/<code>except</code>), <code>auto-ssh</code> (<code>nkmiko</code> backup script), <code>auto-git</code> (commits aur history) aur <code>py-tools</code> (<code>argparse</code>, <code>logging</code>, exit codes aur cron) khatam kiye hone chahiye. Aapko <code>lx-shell</code> ke Linux shell basics bhi chahiye: <code>ls -l</code>, <code>cat</code>, <code>grep</code>, <code>chmod</code>. Yeh module inhe dohraata nahi; inhe use karta hai.</p>

<h3>Analogy: doormat ke neeche ki chaabi</h3>
<p>Socho aap ghar ki chaabi doormat ke neeche chhupate ho. Aasaan hai: kabhi bhoolte nahi. Par doormat public jagah hai. Postman, padosi aur woh ajnabi jisne "doormat ke neeche chaabi" ke baare mein padha hai, sab jaante hain kahan dekhna hai. Script ke andar ka password wahi chaabi hai. Script ghar par nahi rehti. Woh colleague ko copy hoti hai, chat mein paste hoti hai, Git mein commit hoti hai, ticket mein attach hoti hai. Har copy chaabi saath le jaati hai, aur aap copies wapas nahi le sakte.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Ek script aur woh chaar jagah jahan uska password leak ho sakta hai">
<rect x="10" y="80" width="130" height="70" rx="10" fill="#fde68a"/><text x="75" y="108" text-anchor="middle" class="svg-ink" font-size="13">backup.py</text><text x="75" y="128" text-anchor="middle" class="svg-muted" font-size="11">PASSWORD = ...</text>
<rect x="250" y="10" width="190" height="42" rx="8" fill="#fecaca"/><text x="345" y="36" text-anchor="middle" class="svg-ink" font-size="12">1 source code</text>
<rect x="250" y="66" width="190" height="42" rx="8" fill="#fecaca"/><text x="345" y="92" text-anchor="middle" class="svg-ink" font-size="12">2 log files</text>
<rect x="250" y="122" width="190" height="42" rx="8" fill="#fecaca"/><text x="345" y="148" text-anchor="middle" class="svg-ink" font-size="12">3 readable files</text>
<rect x="250" y="178" width="190" height="42" rx="8" fill="#fecaca"/><text x="345" y="204" text-anchor="middle" class="svg-ink" font-size="12">4 kamzor stored hash</text>
<text x="540" y="36" text-anchor="middle" class="svg-muted" font-size="11">Git, chat, tickets</text>
<text x="540" y="92" text-anchor="middle" class="svg-muted" font-size="11">support, SIEM</text>
<text x="540" y="148" text-anchor="middle" class="svg-muted" font-size="11">dusre users</text>
<text x="540" y="204" text-anchor="middle" class="svg-muted" font-size="11">churayi user file</text>
<line x1="140" y1="105" x2="250" y2="31" stroke="#64748b" stroke-width="2"/><line x1="140" y1="112" x2="250" y2="87" stroke="#64748b" stroke-width="2"/><line x1="140" y1="120" x2="250" y2="143" stroke="#64748b" stroke-width="2"/><line x1="140" y1="128" x2="250" y2="199" stroke="#64748b" stroke-width="2"/>
<line x1="440" y1="31" x2="480" y2="31" stroke="#64748b" stroke-width="2"/><line x1="440" y1="87" x2="480" y2="87" stroke="#64748b" stroke-width="2"/><line x1="440" y1="143" x2="480" y2="143" stroke="#64748b" stroke-width="2"/><line x1="440" y1="199" x2="480" y2="199" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Ek password, chaar darwaaze. Yeh module har ek ko band karta hai.</p></div>

<h3>Chaar darwaaze, aur ek vaada</h3>
<table class="cmp"><tr><th>Darwaaza</th><th>Kaise hota hai</th><th>Kaunsi aadat ise band karti hai</th></tr>
<tr><td>1 Source code</td><td>Script mein <code>PASSWORD = "NK@2026"</code> type kiya hua</td><td>Environment variable ya <code>.env</code> file, Git se bahar</td></tr>
<tr><td>2 Logs aur output</td><td><code>logging.info("... password=%s", password)</code>, ya raw config ticket mein paste</td><td>Secrets kabhi log mat karo; <code>secret</code> aur <code>password</code> lines mask karo</td></tr>
<tr><td>3 Readable files</td><td><code>.env</code> default mode se bani, har user padh sakta hai</td><td><code>chmod 600</code> aur code mein check</td></tr>
<tr><td>4 Stored passwords</td><td>Tez, bina salt ka hash jaise plain <code>sha256</code></td><td>Salt aur bahut iterations wala <code>pbkdf2_hmac</code></td></tr>
</table>
<p>Paanchva topic darwaaza nahi, ek vaada hai: <b>integrity</b>. Har backup ka sha256 fingerprint baad mein saabit karne deta hai ki kisi ne saved configuration edit nahi ki.</p>

<h3>Is module ke do labs</h3>
<p><b>Lab 1 (Take the password out of the scripts)</b> mein aap host <code>AUTO01</code> (user <code>netadmin</code>) par do routers, R1 aur R2 (<code>netops</code> / <code>NK@2026</code>), ke saath kaam karte ho. Company Kaveri Foods agle hafte apni scripts Git mein le ja rahi hai, aur <code>backup.py</code> aur <code>audit.py</code> dono mein router password type kiya hua hai. Aap leak dhoondhoge, use environment mein le jaoge, phir protected <code>.env</code> file mein, ek script ko <code>getpass</code> par badloge, aur <code>seal.py</code> se backups seal karoge. <b>Lab 2 (Four leaks in guard.py)</b> mein ek helper tool ek bhi error ke bina chalta hai aur phir bhi chaar tareeqon se leak karta hai; aap har leak ko uske symptom se dhoondhoge aur <code>sed</code> se theek karoge.</p>

<div class="note"><p><b>Defensive voice.</b> Yeh module apne secrets ko bachane ke baare mein hai. Yeh kabhi nahi dikhata ki doosre ke secrets kaise churaye ya crack kiye jaate hain. Labs ke passwords, jaise <code>NK@2026</code>, sirf lab values hain. Lab password kabhi kisi asli jagah reuse mat karo.</p></div>

<div class="eg"><p><b>Worked example.</b> Ek backup script do saal se chal rahi hai. Uske password ki copies gino: server par script, engineer ke laptop par copy, jis din share hui us din ki team chat mein ek, ticket mein ek, aur pichhle mahine ke Git commit mein ek. Paanch copies ka matlab paanch jagah saaf karni hain aur ek password badalna hai. Seekh: prevention sasta hai, cleaning mehnga.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Yeh sochna ki "repository private hai, isliye safe hai" (private repositories share hoti hain, clone hoti hain aur breach hoti hain). Yeh maanna ki secret safe hai kyunki script "sirf hamare server par hai". Har router aur har script ke liye ek hi shared password use karna, taaki ek leak sab kuch khol de.</p></div>
<div class="exam"><p><b>Exam trap.</b> Secret ko <i>dhoondhna mushkil</i> hone se protection nahi milti. Obscurity security nahi hai. Password ko do strings mein todna ya script ke andar base64 mein likhna kuch protect nahi karta.</p></div>

<div class="scn"><h4>Chat mein password</h4><p>Ek naye engineer ne poocha ki nightly backup login kaise karta hai. Ek colleague ne poori <code>backup.py</code> team chat mein paste kar di. Teen mahine baad chat export ek contractor ke saath share hua. Password ek weekend mein chalis routers par badalna pada.</p><p><b>Lesson:</b> jo secret script mein rehta hai woh script ke saath ghoomta hai; jo secret environment mein rehta hai woh machine par rehta hai.</p></div>

<div class="iv"><p class="q">"Credentials ko script mein hard-code kyon nahi karna chahiye?"</p><p>Scripts copy hoti hain, Git mein commit hoti hain, chat mein paste hoti hain aur tickets mein attach hoti hain, isliye hard-coded password har copy mein phail jaata hai aur version history mein reh jaata hai. Credentials environment variables, version control ke bahar protected file, ya secrets manager mein rehne chahiye, aur unhe rotate karna aasaan hona chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Secret chaar darwaazon se leak hota hai: source code, logs, readable files aur kamzor stored hashes.</li>
<li>Integrity paanchva topic hai: sha256 fingerprints saabit karte hain ki backup edit nahi hua.</li>
<li>Prevention sasta hai; copies saaf karna mehnga.</li>
<li>Lab 1 scripts theek karta hai; Lab 2 guard.py ke chaar leaks dhoondhta hai.</li>
</ul></div>
`}};export{e as default};