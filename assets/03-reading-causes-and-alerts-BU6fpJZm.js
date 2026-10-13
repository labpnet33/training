var e={id:`causes-alerts`,h:{en:`Reading causes and setting alert thresholds`,hi:`Causes padhna aur alert thresholds set karna`},body:{en:`
<h3>From "Poor" to "why"</h3>
<p>A Poor score says that something is wrong. The <b>cause</b> says where. The portal names the hop furthest above its baseline, so your reading routine is always the same three questions: which score, which hop, how far above baseline? Then you pick the owner of that hop: the desktop team for Device, the wireless team for Wi-Fi, the ISP for the Internet circuit, the security-cloud path for Cloud path, the application owner for Application.</p>

<table class="cmp"><tr><th>Cause named</th><th>Who acts</th><th>First action</th></tr>
<tr><td>Device</td><td>Desktop support</td><td>Check CPU and memory, close heavy tasks, scan schedule</td></tr>
<tr><td>Wi-Fi</td><td>Wireless or facilities</td><td>Check signal, move closer, check interference</td></tr>
<tr><td>Internet circuit</td><td>Network team, then ISP</td><td>Look at loss and round-trip time, open a ticket with the circuit id</td></tr>
<tr><td>Cloud path</td><td>Network and security team</td><td>Check tunnel state, which node is used, failover</td></tr>
<tr><td>Application</td><td>Application owner</td><td>Share the server response numbers as proof</td></tr>
</table>

<h3>Comparing users to narrow down</h3>
<p>A second reading skill is <b>comparison</b>. If one user is Poor and everyone else on the same site is Good, suspect the user's device or Wi-Fi. If the whole site is Poor, suspect the circuit or the tunnel. If every site is Poor for one application only, suspect the application. The pattern tells you the hop before you even open the detail.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Pattern to hop">
<rect x="20" y="20" width="190" height="50" rx="8" fill="#bae6fd"/><text x="115" y="50" text-anchor="middle" class="svg-ink" font-size="13">One user Poor</text>
<rect x="225" y="20" width="190" height="50" rx="8" fill="#bae6fd"/><text x="320" y="50" text-anchor="middle" class="svg-ink" font-size="13">One site Poor</text>
<rect x="430" y="20" width="190" height="50" rx="8" fill="#bae6fd"/><text x="525" y="50" text-anchor="middle" class="svg-ink" font-size="13">One app Poor everywhere</text>
<line x1="115" y1="70" x2="115" y2="110" stroke="#64748b" stroke-width="2"/><line x1="320" y1="70" x2="320" y2="110" stroke="#64748b" stroke-width="2"/><line x1="525" y1="70" x2="525" y2="110" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="110" width="190" height="60" rx="8" fill="#fed7aa"/><text x="115" y="136" text-anchor="middle" class="svg-ink" font-size="13">Device or Wi-Fi</text><text x="115" y="155" text-anchor="middle" class="svg-muted" font-size="12">local to the user</text>
<rect x="225" y="110" width="190" height="60" rx="8" fill="#fed7aa"/><text x="320" y="136" text-anchor="middle" class="svg-ink" font-size="13">Circuit or cloud path</text><text x="320" y="155" text-anchor="middle" class="svg-muted" font-size="12">shared by the site</text>
<rect x="430" y="110" width="190" height="60" rx="8" fill="#fed7aa"/><text x="525" y="136" text-anchor="middle" class="svg-ink" font-size="13">Application</text><text x="525" y="155" text-anchor="middle" class="svg-muted" font-size="12">server side</text>
</svg><p class="cap">The shape of the problem predicts the hop.</p></div>

<h3>Alert thresholds</h3>
<p>You cannot watch a dashboard all day, so each application has an <b>alert threshold</b> (<code>alertBelow</code>): the portal raises an alert when the score falls below that number. Choosing it is a balance.</p>
<ul>
<li><b>Too low</b> (for example 10): scores can sit in Poor (below 34) for days and no alert fires. Users suffer silently.</li>
<li><b>Too high</b> (for example 90): normal wobble raises alerts all day and the team learns to ignore them.</li>
<li><b>Sensible</b>: set it at the boundary of what you call unacceptable. Since Poor starts below 34, a threshold near that boundary means "tell me when users are in Poor". Many teams pick a little above it for early warning.</li>
</ul>
<p>An alert needs a score, and a score needs a probe. A disabled probe plus a low threshold gives the worst case: nothing is measured and nothing is raised.</p>

<pre class="out">Digital experience &gt; Applications
App     Probe     Alert below   Sites affected
CRM     <span class="hl">disabled</span>  <span class="hl">10</span>            (no data)
Mail    enabled   40            none
Git     enabled   40            none</pre>

<div class="eg"><p><b>Worked example, lab zs-zdx-1.</b> Switch the CRM probe on, then set the threshold from 10 to a value near the Poor boundary (the lab states the exact target), activate changes, and check that CRM now shows a score and that an alert is possible for Poor users.</p></div>

<div class="note"><p><b>What does this change on the wire/policy?</b> Enabling the probe adds test traffic toward the application. Raising the threshold changes nothing on the wire at all; it only changes when a human is notified. Neither setting touches allow or block rules.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Setting thresholds once and never reviewing. (2) Making one global number for apps with very different baselines. (3) Reading an alert as proof of cause; it only says "score is low".</p></div>
<div class="exam"><p><b>Exam trap.</b> "Why did no alert fire although users were Poor?" Check the probe first, then the threshold; both are common answers.</p></div>

<div class="scn"><h4>Silent for a week</h4><p>Jaipur Sales complained about the CRM for days while the alert screen stayed empty. The CRM probe was off, so the application had no score, and the threshold was set to 10, far below Poor. After the probe was on and the threshold raised, the next dip raised an alert within minutes.</p><p><b>Lesson:</b> monitoring is only as good as its switches.</p></div>

<div class="iv"><p class="q">"How do you choose an alert threshold?"</p><p>Tie it to the bucket you call unacceptable, here the Poor boundary, check it against each application's normal range, and review it after incidents. Mention the two failure modes: too low is silent, too high is noisy.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Read score, hop, and distance above baseline, in that order.</li>
<li>Each hop has an owner; send the evidence to that owner.</li>
<li>Compare user, site and application to predict the hop.</li>
<li>Alert threshold too low is silent, too high is noisy.</li>
<li>Probe off means no score and no alert.</li>
</ul></div>
`,hi:`
<h3>"Poor" se "kyun" tak</h3>
<p>Poor score batata hai ki kuch galat hai. <b>Cause</b> batata hai kahan. Portal us hop ka naam batata hai jo baseline se sabse upar hai, to padhne ka routine hamesha teen sawaal hai: kaun sa score, kaun sa hop, baseline se kitna upar? Phir us hop ke owner ko pakdo: Device ke liye desktop team, Wi-Fi ke liye wireless team, Internet circuit ke liye ISP, Cloud path ke liye security-cloud path wali team, Application ke liye application owner.</p>

<table class="cmp"><tr><th>Cause named</th><th>Kaun act karta hai</th><th>Pehla action</th></tr>
<tr><td>Device</td><td>Desktop support</td><td>CPU aur memory check karo, heavy tasks band karo, scan schedule dekho</td></tr>
<tr><td>Wi-Fi</td><td>Wireless ya facilities</td><td>Signal check karo, paas jao, interference dekho</td></tr>
<tr><td>Internet circuit</td><td>Network team, phir ISP</td><td>Loss aur round-trip time dekho, circuit id ke saath ticket kholo</td></tr>
<tr><td>Cloud path</td><td>Network aur security team</td><td>Tunnel state, kaun sa node use ho raha hai, failover check karo</td></tr>
<tr><td>Application</td><td>Application owner</td><td>Proof ke roop mein server response numbers share karo</td></tr>
</table>

<h3>Users ko compare karke narrow karna</h3>
<p>Doosri reading skill hai <b>comparison</b>. Ek user Poor hai aur same site ke baaki sab Good, to user ka device ya Wi-Fi suspect karo. Poori site Poor ho to circuit ya tunnel suspect karo. Sirf ek application har site par Poor ho to application suspect karo. Pattern detail kholne se pehle hi hop bata deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Pattern se hop">
<rect x="20" y="20" width="190" height="50" rx="8" fill="#bae6fd"/><text x="115" y="50" text-anchor="middle" class="svg-ink" font-size="13">Ek user Poor</text>
<rect x="225" y="20" width="190" height="50" rx="8" fill="#bae6fd"/><text x="320" y="50" text-anchor="middle" class="svg-ink" font-size="13">Ek site Poor</text>
<rect x="430" y="20" width="190" height="50" rx="8" fill="#bae6fd"/><text x="525" y="50" text-anchor="middle" class="svg-ink" font-size="13">Ek app sab jagah Poor</text>
<line x1="115" y1="70" x2="115" y2="110" stroke="#64748b" stroke-width="2"/><line x1="320" y1="70" x2="320" y2="110" stroke="#64748b" stroke-width="2"/><line x1="525" y1="70" x2="525" y2="110" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="110" width="190" height="60" rx="8" fill="#fed7aa"/><text x="115" y="136" text-anchor="middle" class="svg-ink" font-size="13">Device ya Wi-Fi</text><text x="115" y="155" text-anchor="middle" class="svg-muted" font-size="12">user ke local</text>
<rect x="225" y="110" width="190" height="60" rx="8" fill="#fed7aa"/><text x="320" y="136" text-anchor="middle" class="svg-ink" font-size="13">Circuit ya cloud path</text><text x="320" y="155" text-anchor="middle" class="svg-muted" font-size="12">site share karti hai</text>
<rect x="430" y="110" width="190" height="60" rx="8" fill="#fed7aa"/><text x="525" y="136" text-anchor="middle" class="svg-ink" font-size="13">Application</text><text x="525" y="155" text-anchor="middle" class="svg-muted" font-size="12">server side</text>
</svg><p class="cap">Problem ki shape hop ka andaza deti hai.</p></div>

<h3>Alert thresholds</h3>
<p>Aap poora din dashboard nahi dekh sakte, isliye har application ka ek <b>alert threshold</b> (<code>alertBelow</code>) hota hai: score us number se neeche girta hai to portal alert raise karta hai. Ise chunna ek balance hai.</p>
<ul>
<li><b>Bahut low</b> (jaise 10): score dinon tak Poor (34 se neeche) mein reh sakta hai aur alert nahi aata. Users chupchaap pareshaan hote hain.</li>
<li><b>Bahut high</b> (jaise 90): normal utaar-chadhaav din bhar alerts deta hai aur team unhe ignore karna seekh leti hai.</li>
<li><b>Sensible</b>: use us boundary par rakho jise aap unacceptable kehte ho. Poor 34 se neeche shuru hota hai, to us boundary ke paas threshold ka matlab "jab users Poor mein hon tab batao". Kai teams early warning ke liye thoda upar rakhti hain.</li>
</ul>
<p>Alert ke liye score chahiye, aur score ke liye probe. Disabled probe aur low threshold sabse bura case hai: kuch measure nahi hota aur kuch raise nahi hota.</p>

<pre class="out">Digital experience &gt; Applications
App     Probe     Alert below   Sites affected
CRM     <span class="hl">disabled</span>  <span class="hl">10</span>            (no data)
Mail    enabled   40            none
Git     enabled   40            none</pre>

<div class="eg"><p><b>Worked example, lab zs-zdx-1.</b> CRM probe on karo, phir threshold 10 se Poor boundary ke paas ki value par karo (lab exact target batata hai), activate changes karo, aur check karo ki CRM ab score dikhata hai aur Poor users ke liye alert possible hai.</p></div>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Probe enable karne se application ki taraf test traffic judta hai. Threshold badhane se wire par kuch nahi badalta; sirf yeh badalta hai ki insaan ko kab notify kiya jaye. Dono settings allow ya block rules ko nahi chhuti.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Thresholds ek baar set karke kabhi review na karna. (2) Bahut alag baselines wali apps ke liye ek global number rakhna. (3) Alert ko cause ka proof samajhna; woh sirf "score low hai" kehta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Users Poor the phir bhi alert kyun nahi aaya?" Pehle probe check karo, phir threshold; dono common jawab hain.</p></div>

<div class="scn"><h4>Ek hafte tak chup</h4><p>Jaipur Sales dinon tak CRM ki complain karti rahi jabki alert screen khaali rahi. CRM probe off tha, to application ka score hi nahi tha, aur threshold 10 tha, Poor se bahut neeche. Probe on aur threshold badhane ke baad agle dip par kuch minutes mein alert aaya.</p><p><b>Seekh:</b> monitoring utni hi achhi hai jitne uske switches.</p></div>

<div class="iv"><p class="q">"Alert threshold kaise chunoge?"</p><p>Use us bucket se jodo jo aap unacceptable kehte ho, yahan Poor boundary, har application ki normal range se check karo, aur incidents ke baad review karo. Do failure modes mention karo: bahut low chup rehta hai, bahut high shor karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Score, hop aur baseline se doori, isi order mein padho.</li>
<li>Har hop ka owner hai; evidence usi owner ko bhejo.</li>
<li>User, site aur application compare karke hop predict karo.</li>
<li>Alert threshold bahut low chup, bahut high shor.</li>
<li>Probe off matlab no score aur no alert.</li>
</ul></div>
`}};export{e as default};