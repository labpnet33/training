var e={id:`rule-actions`,h:{en:`Writing rules: conditions, actions and logging`,hi:`Rules likhna: conditions, actions aur logging`},body:{en:`
<p>A nightclub bouncer has more answers than "in" and "out". He can wave a regular through without searching him (Trust). He can let you in but keep watching you (Allow with inspection). He can note your name in a book and let the next bouncer decide (Monitor). He can refuse you quietly, or say "no" loudly so you stop waiting (Block, Block with reset). He can even warn you "this place is not for you, are you sure?" and let you in if you insist (Interactive Block). Threat Defense rule actions are exactly these answers.</p>

<h3>Anatomy of a rule</h3>
<p>Lab GUI: <b>Policies → Access Control → Add Rule</b>. The dialog has Name, Action, Enabled and <b>Log at end</b> at the top, then the conditions: Source Zones, Destination Zones, Source Networks, Destination Networks, Destination Ports, and (when the inspection features are present) Applications, URLs, URL reputation, Intrusion policy and File policy. An empty condition means <b>any</b>. The Destination Networks field reminds you: use the server's real address, because the policy sees addresses after NAT.</p>
<p>For lab 1 you fill it like this:</p>
<pre class="code"><span class="c">! Policies → Access Control → Add Rule</span>
Name                  Inside-Out
Action                Allow
Source Zones          INSIDE
Destination Zones     OUTSIDE
Source Networks       (any)
Destination Networks  (any)
Destination Ports     HTTP, HTTPS, DNS, ICMP
Enabled               yes      Log at end   yes
<span class="c">! Save. The rule is now in the candidate policy only.</span></pre>

<h3>The actions</h3>
<table class="cmp"><tr><th>Action</th><th>What happens</th><th>Typical use</th></tr>
<tr><td><b>Allow</b></td><td>Permits the traffic and inspects it with the rule's intrusion and file policies</td><td>Normal permitted traffic</td></tr>
<tr><td><b>Trust</b></td><td>Permits the traffic with no further inspection (no IPS, no file, no discovery)</td><td>Known, high-volume, trusted flows such as backups</td></tr>
<tr><td><b>Monitor</b></td><td>Logs a connection event and keeps evaluating the next rules; never decides</td><td>Measuring how much traffic a planned rule would match</td></tr>
<tr><td><b>Block</b></td><td>Silently drops the traffic</td><td>Default way to deny</td></tr>
<tr><td><b>Block with reset</b></td><td>Drops and sends a TCP reset (or ICMP unreachable for UDP)</td><td>Inside users, so applications fail fast instead of timing out</td></tr>
<tr><td><b>Interactive Block</b> (with or without reset)</td><td>For web traffic, shows a warning page; the user can click to continue, then the site is allowed for a bypass timeout (default 600 seconds)</td><td>Soft acceptable-use controls, for example social media at work</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Rule action decision">
<rect x="10" y="70" width="130" height="56" rx="8" fill="#e2e8f0"/><text x="75" y="95" text-anchor="middle" class="svg-ink" font-size="13">Rule matches</text><text x="75" y="113" text-anchor="middle" class="svg-muted" font-size="12">all conditions</text>
<rect x="200" y="10" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="270" y="37" text-anchor="middle" class="svg-ink" font-size="13">Allow: inspect</text>
<rect x="200" y="62" width="140" height="44" rx="8" fill="#bae6fd"/><text x="270" y="89" text-anchor="middle" class="svg-ink" font-size="13">Trust: no inspect</text>
<rect x="200" y="114" width="140" height="44" rx="8" fill="#fed7aa"/><text x="270" y="141" text-anchor="middle" class="svg-ink" font-size="13">Block / reset</text>
<rect x="420" y="70" width="210" height="56" rx="8" fill="#fde68a"/><text x="525" y="95" text-anchor="middle" class="svg-ink" font-size="13">Monitor: log, then</text><text x="525" y="113" text-anchor="middle" class="svg-ink" font-size="13">evaluate the next rule</text>
<line x1="140" y1="90" x2="200" y2="32" stroke="#64748b" stroke-width="2"/><line x1="140" y1="98" x2="200" y2="84" stroke="#64748b" stroke-width="2"/><line x1="140" y1="106" x2="200" y2="136" stroke="#64748b" stroke-width="2"/>
<line x1="340" y1="98" x2="420" y2="98" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">Every action except Monitor ends the evaluation</text>
</svg><p class="cap">Allow, Trust and Block decide; Monitor only records and passes the flow on.</p></div>

<h3>Logging</h3>
<p>Connection events are what the Analysis tab shows. Allow and Trust rules can log at the <b>beginning</b> and/or the <b>end</b> of a connection; logging at the end is preferred because the event then contains bytes, duration and the final verdict. Block rules can log only at the beginning, because a blocked connection has no end. Monitor rules always log at the end. In the lab, the rule dialog's <i>Log at end</i> box controls this, and the default action logs its blocks too. Logging every connection from a busy rule costs disk space on the manager, so many teams log at end for Allow rules and at beginning for Block rules.</p>

<h3>Ordering rules well</h3>
<ul>
<li><b>Specific before general.</b> A rule for ADMIN 10.0.1.50 must sit above a broad rule that blocks the same port for everyone.</li>
<li><b>Cheap before expensive.</b> Simple Layer 3/4 Block rules near the top stop junk early; rules with applications and URLs need Snort to see a few packets first (late match).</li>
<li><b>Look for shadowed rules.</b> A rule that can never match because a rule above covers all its traffic. The Management Center can show rule conflicts, and <b>hit counts</b> reveal rules that never match.</li>
</ul>
<pre class="out">&gt; show access-control-config
-----------------[ Rule: Block-SSH ]-----------------
    Action                : Block
    Destination Ports     : SSH (protocol 6, port 22)
<span class="hl">    Rule Hits             : 12</span>
-----------------[ Rule: Admin-SSH ]-----------------
    Action                : Allow
    Source Networks       : ADMIN
<span class="hl">    Rule Hits             : 0</span></pre>
<p>A rule below another with zero hits is the classic sign of shadowing: the SSH of ADMIN is already eaten by Block-SSH.</p>

<div class="eg"><p><b>Worked example.</b> Ports and actions together: rule Inside-Out with HTTP, HTTPS, DNS and ICMP and action Allow. PC1 browses 8.8.8.8 on TCP 80: match, Allow, inspected. PC1 pings 8.8.8.8: match (ICMP), Allow. PC1 tries SSH to 8.8.8.8 on TCP 22: no condition matches port 22, so evaluation continues to the end and the <b>Default Action</b> blocks it. Connection Events show <i>Block, Default Action, tcp/22</i>.</p></div>

<div class="warn"><p><b>Common mistake.</b> Using Trust as "a stronger Allow". Trust switches off intrusion and file inspection for that traffic. If an attacker uses a trusted path, nothing inspects it. Also, using Monitor and expecting it to permit: Monitor never decides the verdict.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which action logs and continues to the next rule?" Monitor. "Which action permits without further inspection?" Trust. "Which action sends a TCP reset?" Block with reset (and Interactive Block with reset). Block rules cannot log at the end of a connection.</p></div>

<div class="scn"><h4>The help desk that waited 30 seconds</h4><p>Users complained that a blocked internal tool "hangs for half a minute" before failing, and the help desk thought the network was slow. The rule was Block, so the client waited for its TCP timeout. The engineer changed the action to Block with reset for inside users. The tool now failed instantly with "connection refused", and the help desk could tell users immediately that the tool was not allowed.</p><p><b>Lesson:</b> for your own users, Block with reset gives fast, clear failures; for the internet, silent Block gives attackers less information.</p></div>

<div class="iv"><p class="q">"What is the difference between Allow and Trust?"</p><p>Both permit. Allow passes the traffic through the rule's intrusion and file policies; Trust stops further inspection once the rule matches, which saves Snort resources but removes protection. Use Trust only for known, trusted, high-volume flows, and say that prefilter Fastpath goes further by never sending the flow to Snort. Mention Monitor too: it logs and continues, it never permits or blocks by itself.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A rule matches only when every condition type matches; empty means any.</li>
<li>Actions: Allow (inspect), Trust (no further inspection), Monitor (log and continue), Block, Block with reset, Interactive Block.</li>
<li>Log at end for Allow and Trust; Block rules log only at the beginning.</li>
<li>Specific rules above general ones; zero hit counts point to shadowed rules.</li>
<li>Lab 1 rule: Inside-Out, INSIDE to OUTSIDE, HTTP, HTTPS, DNS, ICMP, Allow.</li>
</ul></div>
`,hi:`
<p>Nightclub ke bouncer ke paas "andar" aur "bahar" se zyada jawab hote hain. Woh ek regular ko bina talaashi liye andar jaane de sakta hai (Trust). Woh aapko andar jaane de sakta hai par aap par nazar rakhta hai (inspection ke saath Allow). Woh aapka naam ek kitaab mein note karke agle bouncer ko decide karne de sakta hai (Monitor). Woh aapko chupchaap mana kar sakta hai, ya zor se "nahi" bol sakta hai taaki aap intezaar karna band karo (Block, Block with reset). Woh aapko warn bhi kar sakta hai "yeh jagah aapke liye nahi hai, pakka?" aur zid karne par andar jaane de sakta hai (Interactive Block). Threat Defense rule actions bilkul yahi jawab hain.</p>

<h3>Rule ki anatomy</h3>
<p>Lab GUI: <b>Policies → Access Control → Add Rule</b>. Dialog mein upar Name, Action, Enabled aur <b>Log at end</b> hain, phir conditions: Source Zones, Destination Zones, Source Networks, Destination Networks, Destination Ports, aur (jab inspection features maujood hon) Applications, URLs, URL reputation, Intrusion policy aur File policy. Khaali condition ka matlab hai <b>any</b>. Destination Networks field aapko yaad dilata hai: server ka real address use karo, kyunki policy NAT ke baad ke addresses dekhti hai.</p>
<p>Lab 1 ke liye aap ise aise bharte ho:</p>
<pre class="code"><span class="c">! Policies → Access Control → Add Rule</span>
Name                  Inside-Out
Action                Allow
Source Zones          INSIDE
Destination Zones     OUTSIDE
Source Networks       (any)
Destination Networks  (any)
Destination Ports     HTTP, HTTPS, DNS, ICMP
Enabled               yes      Log at end   yes
<span class="c">! Save. Rule ab sirf candidate policy mein hai.</span></pre>

<h3>Actions</h3>
<table class="cmp"><tr><th>Action</th><th>Kya hota hai</th><th>Typical use</th></tr>
<tr><td><b>Allow</b></td><td>Traffic permit karta hai aur rule ki intrusion aur file policies se inspect karta hai</td><td>Normal permitted traffic</td></tr>
<tr><td><b>Trust</b></td><td>Traffic ko bina aage inspection ke permit karta hai (na IPS, na file, na discovery)</td><td>Jaane-pehchaane, high-volume, trusted flows jaise backups</td></tr>
<tr><td><b>Monitor</b></td><td>Connection event log karta hai aur agli rules evaluate karta rehta hai; kabhi decide nahi karta</td><td>Yeh naapna ki planned rule kitna traffic match karegi</td></tr>
<tr><td><b>Block</b></td><td>Traffic chupchaap drop karta hai</td><td>Deny karne ka default tarika</td></tr>
<tr><td><b>Block with reset</b></td><td>Drop karta hai aur TCP reset bhejta hai (UDP ke liye ICMP unreachable)</td><td>Inside users, taaki applications timeout ki jagah jaldi fail hon</td></tr>
<tr><td><b>Interactive Block</b> (reset ke saath ya bina)</td><td>Web traffic ke liye warning page dikhata hai; user continue click kar sakta hai, phir site ek bypass timeout (default 600 seconds) ke liye allowed rehti hai</td><td>Soft acceptable-use controls, jaise kaam par social media</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Rule action decision">
<rect x="10" y="70" width="130" height="56" rx="8" fill="#e2e8f0"/><text x="75" y="95" text-anchor="middle" class="svg-ink" font-size="13">Rule match</text><text x="75" y="113" text-anchor="middle" class="svg-muted" font-size="12">saari conditions</text>
<rect x="200" y="10" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="270" y="37" text-anchor="middle" class="svg-ink" font-size="13">Allow: inspect</text>
<rect x="200" y="62" width="140" height="44" rx="8" fill="#bae6fd"/><text x="270" y="89" text-anchor="middle" class="svg-ink" font-size="13">Trust: inspect nahi</text>
<rect x="200" y="114" width="140" height="44" rx="8" fill="#fed7aa"/><text x="270" y="141" text-anchor="middle" class="svg-ink" font-size="13">Block / reset</text>
<rect x="420" y="70" width="210" height="56" rx="8" fill="#fde68a"/><text x="525" y="95" text-anchor="middle" class="svg-ink" font-size="13">Monitor: log, phir</text><text x="525" y="113" text-anchor="middle" class="svg-ink" font-size="13">agli rule evaluate</text>
<line x1="140" y1="90" x2="200" y2="32" stroke="#64748b" stroke-width="2"/><line x1="140" y1="98" x2="200" y2="84" stroke="#64748b" stroke-width="2"/><line x1="140" y1="106" x2="200" y2="136" stroke="#64748b" stroke-width="2"/>
<line x1="340" y1="98" x2="420" y2="98" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">Monitor ke alawa har action evaluation khatam karta hai</text>
</svg><p class="cap">Allow, Trust aur Block decide karte hain; Monitor sirf record karke flow aage bhejta hai.</p></div>

<h3>Logging</h3>
<p>Connection events wahi hain jo Analysis tab dikhata hai. Allow aur Trust rules connection ki <b>shuruaat</b> aur/ya <b>ant</b> mein log kar sakti hain; ant mein logging behtar hai kyunki tab event mein bytes, duration aur final verdict hota hai. Block rules sirf shuruaat mein log kar sakti hain, kyunki blocked connection ka koi ant nahi hota. Monitor rules hamesha ant mein log karti hain. Lab mein rule dialog ka <i>Log at end</i> box ise control karta hai, aur default action bhi apne blocks log karta hai. Busy rule ke har connection ko log karna manager par disk space khata hai, isliye kai teams Allow rules ke liye ant mein aur Block rules ke liye shuruaat mein log karti hain.</p>

<h3>Rules ko achhe se order karna</h3>
<ul>
<li><b>Specific pehle, general baad mein.</b> ADMIN 10.0.1.50 ki rule us broad rule ke upar honi chahiye jo sabke liye same port block karti hai.</li>
<li><b>Sasti pehle, mehngi baad mein.</b> Upar ke paas simple Layer 3/4 Block rules kachra jaldi rokti hain; applications aur URLs wali rules ko pehle Snort ko kuch packets dekhne dene padte hain (late match).</li>
<li><b>Shadowed rules dhoondho.</b> Aisi rule jo kabhi match nahi ho sakti kyunki upar ki rule uska saara traffic cover karti hai. Management Center rule conflicts dikha sakta hai, aur <b>hit counts</b> kabhi match na hone wali rules dikhate hain.</li>
</ul>
<pre class="out">&gt; show access-control-config
-----------------[ Rule: Block-SSH ]-----------------
    Action                : Block
    Destination Ports     : SSH (protocol 6, port 22)
<span class="hl">    Rule Hits             : 12</span>
-----------------[ Rule: Admin-SSH ]-----------------
    Action                : Allow
    Source Networks       : ADMIN
<span class="hl">    Rule Hits             : 0</span></pre>
<p>Doosri rule ke neeche zero hits wali rule shadowing ka classic sign hai: ADMIN ka SSH pehle hi Block-SSH kha jaati hai.</p>

<div class="eg"><p><b>Worked example.</b> Ports aur actions saath mein: HTTP, HTTPS, DNS aur ICMP ke saath rule Inside-Out, action Allow. PC1 TCP 80 par 8.8.8.8 browse karta hai: match, Allow, inspected. PC1 8.8.8.8 ko ping karta hai: match (ICMP), Allow. PC1 TCP 22 par 8.8.8.8 ko SSH try karta hai: koi condition port 22 match nahi karti, isliye evaluation aakhir tak jaata hai aur <b>Default Action</b> use block karta hai. Connection Events <i>Block, Default Action, tcp/22</i> dikhate hain.</p></div>

<div class="warn"><p><b>Common galti.</b> Trust ko "zyada strong Allow" ki tarah use karna. Trust us traffic ke liye intrusion aur file inspection band kar deta hai. Agar attacker trusted path use kare, to use koi inspect nahi karta. Aur Monitor use karke ummeed karna ki woh permit karega: Monitor kabhi verdict decide nahi karta.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Kaunsa action log karke agli rule par jaata hai?" Monitor. "Kaunsa action bina aage inspection ke permit karta hai?" Trust. "Kaunsa action TCP reset bhejta hai?" Block with reset (aur Interactive Block with reset). Block rules connection ke ant mein log nahi kar sakti.</p></div>

<div class="scn"><h4>Help desk jo 30 second intezaar karti rahi</h4><p>Users ne shikayat ki ki ek blocked internal tool fail hone se pehle "aadha minute latakta hai", aur help desk ko laga network slow hai. Rule Block thi, isliye client apne TCP timeout ka intezaar karta tha. Engineer ne inside users ke liye action Block with reset kar diya. Tool ab turant "connection refused" ke saath fail hota tha, aur help desk users ko turant bata sakti thi ki tool allowed nahi hai.</p><p><b>Seekh:</b> apne users ke liye Block with reset tez, saaf failures deta hai; internet ke liye silent Block attackers ko kam information deta hai.</p></div>

<div class="iv"><p class="q">"Allow aur Trust mein kya fark hai?"</p><p>Dono permit karte hain. Allow traffic ko rule ki intrusion aur file policies se guzarta hai; Trust rule match hone ke baad aage ka inspection rok deta hai, jo Snort resources bachata hai par protection hata deta hai. Trust sirf jaane-pehchaane, trusted, high-volume flows ke liye use karo, aur batao ki prefilter Fastpath aur aage jaata hai, flow ko kabhi Snort tak bhejta hi nahi. Monitor bhi mention karo: yeh log karke aage badhta hai, khud kabhi permit ya block nahi karta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Rule tabhi match hoti hai jab har condition type match ho; khaali ka matlab any.</li>
<li>Actions: Allow (inspect), Trust (aage inspection nahi), Monitor (log aur continue), Block, Block with reset, Interactive Block.</li>
<li>Allow aur Trust ke liye ant mein log; Block rules sirf shuruaat mein log karti hain.</li>
<li>Specific rules general ke upar; zero hit counts shadowed rules ki taraf ishara karte hain.</li>
<li>Lab 1 rule: Inside-Out, INSIDE se OUTSIDE, HTTP, HTTPS, DNS, ICMP, Allow.</li>
</ul></div>
`}};export{e as default};