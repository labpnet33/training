var e={id:`deep-inspection`,h:{en:`Deep inspection per rule`,hi:`Har rule par deep inspection`},body:{en:`
<p>Chapter 1 gave you the two layers. This chapter is about the link between them: the <b>deep inspection flag on the Access rule</b>. It is the most common reason a protected-looking server is not protected at all.</p>

<h3>Start with an analogy: the lift with a security guard</h3>
<p>Think of an office building with many lifts. The guard (the inspection engine) is paid and trained, but he stands only at lifts that carry a sign "bags checked here". Visitors who use another lift are never checked. In the NGFW, each Access rule is one lift. The sign is the deep inspection flag.</p>

<h3>What the flag does</h3>
<p>The engine first matches the packet to an Access rule. If the action is Allow and the rule has the deep inspection flag, the engine passes the traffic to the inspection stage, which uses the Inspection policy. If the flag is missing, the traffic is simply allowed; the engine does not look at the content. That is why the lesson of this chapter is short and important:</p>
<ul>
<li>An Access rule alone only allows or blocks. It judges addresses and Service.</li>
<li>Content is judged only when the matching rule carries the deep inspection flag and the Inspection policy has deep inspection on.</li>
<li>The wrong flag, on the wrong rule, lets an exploit pattern pass without a single log line about it.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Two rules, one with the flag">
<rect x="10" y="10" width="190" height="60" rx="8" fill="#e2e8f0"/><text x="105" y="36" text-anchor="middle" class="svg-ink" font-size="13">Request /vuln-test</text><text x="105" y="56" text-anchor="middle" class="svg-muted" font-size="12">to WEB1, port 80</text>
<rect x="250" y="10" width="170" height="60" rx="8" fill="#bae6fd"/><text x="335" y="36" text-anchor="middle" class="svg-ink" font-size="13">Rule matches: Allow</text><text x="335" y="56" text-anchor="middle" class="svg-muted" font-size="12">DMZ web rule</text>
<line x1="200" y1="40" x2="250" y2="40" stroke="#64748b" stroke-width="2"/>
<rect x="250" y="100" width="170" height="50" rx="8" fill="#fed7aa"/><text x="335" y="130" text-anchor="middle" class="svg-ink" font-size="13">Deep flag OFF</text>
<rect x="470" y="100" width="160" height="50" rx="8" fill="#fed7aa"/><text x="550" y="130" text-anchor="middle" class="svg-ink" font-size="13">Passes unseen</text>
<line x1="335" y1="70" x2="335" y2="100" stroke="#64748b" stroke-width="2"/><line x1="420" y1="125" x2="470" y2="125" stroke="#64748b" stroke-width="2"/>
<rect x="250" y="180" width="170" height="50" rx="8" fill="#bbf7d0"/><text x="335" y="210" text-anchor="middle" class="svg-ink" font-size="13">Deep flag ON</text>
<rect x="470" y="180" width="160" height="50" rx="8" fill="#ddd6fe"/><text x="550" y="210" text-anchor="middle" class="svg-ink" font-size="13">Terminate + log</text>
<line x1="335" y1="150" x2="335" y2="180" stroke="#64748b" stroke-width="2"/><line x1="420" y1="205" x2="470" y2="205" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Same traffic, same rule action. Only the flag changes the outcome.</p></div>

<h3>Which rules should get the flag?</h3>
<p>Not every rule. Inspection costs engine capacity, and some traffic has nothing to inspect. A sensible starting point:</p>
<table class="cmp"><tr><th>Traffic</th><th>Flag?</th><th>Reason</th></tr>
<tr><td>Internet to DMZ web server (HTTP)</td><td>Yes</td><td>Exposed server, attacked first</td></tr>
<tr><td>Staff LAN to Internet (web)</td><td>Yes</td><td>Clients can fetch harmful content</td></tr>
<tr><td>SMC contact (engine to NK-SMC)</td><td>No</td><td>Management channel, fixed and trusted</td></tr>
<tr><td>ICMP ping for monitoring</td><td>Usually no</td><td>Little content to inspect</td></tr>
</table>
<p>Prefer to flag by risk. Flagging everything blindly raises false positives and load; flagging nothing leaves you blind.</p>

<div class="eg"><p><b>Worked example (lab fp-inspection-1).</b> At the Pune branch the DMZ rule allows Internet clients (any) to srv-web (172.16.20.20) on HTTP. A test client requests the path /vuln-test on WEB1. The goal of the lab: after you enable the deep inspection flag on that rule and press Install policy, the same request is terminated by situation EXPLOIT-TEST, while a normal request to the home page still works. Order of work: open the rule in Policies, set the flag, check that the Inspection policy has deep inspection on, install, retest both requests, read the log.</p></div>

<h3>What the evidence looks like</h3>
<p>This is simulator-style output, shown to teach reading; the exact columns in a real console depend on your NGFW version.</p>
<pre class="out">Before (flag off)
time      rule          action  log level  note
09:14:02  DMZ-web       Allow   Stored     Deep inspection is off in the matching rule: content is not inspected

After install (flag on)
time      rule          action  log level  note
09:21:47  DMZ-web       Terminate  Stored  <span class="hl">Situation EXPLOIT-TEST matched: Terminate</span>
09:21:55  DMZ-web       Allow   Stored     normal request, no situation</pre>
<p>Read the second line. The rule is the same. The action in the log changed from Allow to Terminate because the inspection stage overruled it for that one connection.</p>

<div class="warn"><p><b>Common mistakes.</b></p><ul>
<li>Setting the flag on a rule that sits below a broader Allow rule. First match wins, so the lower rule never matches (a shadowed rule warning does not block install). Put the flagged rule where it is actually hit.</li>
<li>Forgetting that the Inspection policy itself must have deep inspection active.</li>
<li>Testing before installing. The engine keeps using the old snapshot until Install policy.</li>
</ul></div>

<div class="exam"><p><b>Exam trap.</b> "The rule action is Allow, so the exploit was allowed by design." Wrong: Allow lets the connection start; deep inspection can still terminate it when the flag is on. Terminate is a log action value alongside Allow, Discard, Permit and Refuse.</p></div>

<div class="scn"><h4>The server with the wrong flag</h4><p>MyPnetLab Pune had two rules for the DMZ: one for HTTP, one for HTTPS. A junior admin enabled the deep inspection flag on the HTTPS rule because "HTTPS is the secure one". The pen-test summary, a controlled training exercise, showed the HTTP rule passing the training pattern. The admin checked the log, saw Allow and no situation, opened the HTTP rule, saw the flag off, fixed it and installed. The retest showed Terminate with situation EXPLOIT-TEST.</p><p><b>Lesson:</b> flag the rule that actually carries the traffic you are worried about, and prove it with a log line.</p></div>

<div class="iv"><p class="q">"A server is behind your firewall with an IPS policy configured, yet an attack pattern got through. What do you check first?"</p><p>Strong answer: which Access rule matched the connection, whether that rule has the deep inspection flag, whether the Inspection policy has deep inspection active, whether HTTPS was decrypted, and whether the policy was installed. Then read the log for the situation. Mention you do not turn the rule into a broad Allow to make it work.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Deep inspection is a per-rule flag, not a global switch.</li>
<li>An Access rule alone only allows or blocks; it never reads content.</li>
<li>Flag the rules that carry risky traffic: exposed servers and user web access.</li>
<li>The log shows Terminate and the situation when inspection acts.</li>
<li>Install policy, then retest both a bad and a normal request.</li>
</ul></div>
`,hi:`
<p>Chapter 1 mein aapne do layers dekhi. Yeh chapter unke beech ke link ke baare mein hai: <b>Access rule par deep inspection flag</b>. Protected dikhne wala server asal mein protected nahi hota, iska sabse common reason yahi hai.</p>

<h3>Ek analogy se shuru karo: security guard wali lift</h3>
<p>Ek office building socho jisme kayi lifts hain. Guard (inspection engine) trained aur paid hai, lekin woh sirf un lifts par khada hota hai jinpar "bags checked here" ka sign hai. Doosri lift use karne wale visitors ko kabhi check nahi kiya jaata. NGFW mein har Access rule ek lift hai. Sign deep inspection flag hai.</p>

<h3>Flag kya karta hai</h3>
<p>Engine pehle packet ko ek Access rule se match karta hai. Agar action Allow hai aur rule par deep inspection flag hai, to engine traffic ko inspection stage ko deta hai, jo Inspection policy use karta hai. Agar flag nahi hai, to traffic bas allow ho jaata hai; engine content nahi dekhta. Isliye is chapter ka lesson chhota lekin zaroori hai:</p>
<ul>
<li>Akela Access rule sirf allow ya block karta hai. Woh addresses aur Service judge karta hai.</li>
<li>Content tabhi judge hota hai jab matching rule par deep inspection flag ho aur Inspection policy mein deep inspection on ho.</li>
<li>Galat rule par galat flag exploit pattern ko bina ek bhi log line ke nikalne deta hai.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Do rules, ek mein flag">
<rect x="10" y="10" width="190" height="60" rx="8" fill="#e2e8f0"/><text x="105" y="36" text-anchor="middle" class="svg-ink" font-size="13">Request /vuln-test</text><text x="105" y="56" text-anchor="middle" class="svg-muted" font-size="12">WEB1 ko, port 80</text>
<rect x="250" y="10" width="170" height="60" rx="8" fill="#bae6fd"/><text x="335" y="36" text-anchor="middle" class="svg-ink" font-size="13">Rule match: Allow</text><text x="335" y="56" text-anchor="middle" class="svg-muted" font-size="12">DMZ web rule</text>
<line x1="200" y1="40" x2="250" y2="40" stroke="#64748b" stroke-width="2"/>
<rect x="250" y="100" width="170" height="50" rx="8" fill="#fed7aa"/><text x="335" y="130" text-anchor="middle" class="svg-ink" font-size="13">Deep flag OFF</text>
<rect x="470" y="100" width="160" height="50" rx="8" fill="#fed7aa"/><text x="550" y="130" text-anchor="middle" class="svg-ink" font-size="13">Bina dekhe pass</text>
<line x1="335" y1="70" x2="335" y2="100" stroke="#64748b" stroke-width="2"/><line x1="420" y1="125" x2="470" y2="125" stroke="#64748b" stroke-width="2"/>
<rect x="250" y="180" width="170" height="50" rx="8" fill="#bbf7d0"/><text x="335" y="210" text-anchor="middle" class="svg-ink" font-size="13">Deep flag ON</text>
<rect x="470" y="180" width="160" height="50" rx="8" fill="#ddd6fe"/><text x="550" y="210" text-anchor="middle" class="svg-ink" font-size="13">Terminate + log</text>
<line x1="335" y1="150" x2="335" y2="180" stroke="#64748b" stroke-width="2"/><line x1="420" y1="205" x2="470" y2="205" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Same traffic, same rule action. Sirf flag outcome badalta hai.</p></div>

<h3>Kin rules ko flag dena chahiye?</h3>
<p>Sabko nahi. Inspection engine capacity khaata hai, aur kuch traffic mein inspect karne layak kuch hota hi nahi. Ek sensible starting point:</p>
<table class="cmp"><tr><th>Traffic</th><th>Flag?</th><th>Reason</th></tr>
<tr><td>Internet se DMZ web server (HTTP)</td><td>Yes</td><td>Exposed server, sabse pehle attack hota hai</td></tr>
<tr><td>Staff LAN se Internet (web)</td><td>Yes</td><td>Clients harmful content fetch kar sakte hain</td></tr>
<tr><td>SMC contact (engine se NK-SMC)</td><td>No</td><td>Management channel, fixed aur trusted</td></tr>
<tr><td>Monitoring ke liye ICMP ping</td><td>Usually no</td><td>Inspect karne ko kam content</td></tr>
</table>
<p>Risk ke hisaab se flag lagao. Andhadhund sab par flag lagane se false positives aur load badhta hai; kisi par nahi lagane se aap andhe ho jaate ho.</p>

<div class="eg"><p><b>Worked example (lab fp-inspection-1).</b> Pune branch par DMZ rule Internet clients (any) ko srv-web (172.16.20.20) tak HTTP par allow karta hai. Ek test client WEB1 par path /vuln-test maangta hai. Lab ka goal: us rule par deep inspection flag enable karke Install policy dabane ke baad wahi request situation EXPLOIT-TEST se terminate ho, jabki home page ki normal request chalti rahe. Kaam ka order: Policies mein rule kholo, flag set karo, check karo ki Inspection policy mein deep inspection on hai, install karo, dono requests dobara test karo, log padho.</p></div>

<h3>Evidence kaisa dikhta hai</h3>
<p>Yeh simulator-style output hai, padhna sikhane ke liye; real console ke exact columns aapke NGFW version par depend karte hain.</p>
<pre class="out">Before (flag off)
time      rule          action  log level  note
09:14:02  DMZ-web       Allow   Stored     Deep inspection is off in the matching rule: content is not inspected

After install (flag on)
time      rule          action  log level  note
09:21:47  DMZ-web       Terminate  Stored  <span class="hl">Situation EXPLOIT-TEST matched: Terminate</span>
09:21:55  DMZ-web       Allow   Stored     normal request, no situation</pre>
<p>Doosri line padho. Rule wahi hai. Log mein action Allow se Terminate ho gaya kyunki inspection stage ne us ek connection ke liye use overrule kiya.</p>

<div class="warn"><p><b>Common mistakes.</b></p><ul>
<li>Flag ek aise rule par lagana jo broader Allow rule ke neeche hai. First match wins, isliye neeche wala rule kabhi match nahi hota (shadowed rule warning install ko block nahi karti). Flagged rule wahan rakho jahan woh sach mein hit ho.</li>
<li>Yeh bhoolna ki Inspection policy mein khud deep inspection active hona chahiye.</li>
<li>Install se pehle test karna. Install policy tak engine purana snapshot use karta hai.</li>
</ul></div>

<div class="exam"><p><b>Exam trap.</b> "Rule action Allow hai, to exploit design ke hisaab se allowed tha." Galat: Allow connection ko start hone deta hai; flag on ho to deep inspection phir bhi use terminate kar sakta hai. Terminate ek log action value hai, Allow, Discard, Permit aur Refuse ke saath.</p></div>

<div class="scn"><h4>Galat flag wala server</h4><p>MyPnetLab Pune ke paas DMZ ke do rules the: ek HTTP ka, ek HTTPS ka. Ek junior admin ne HTTPS rule par deep inspection flag enable kiya kyunki "HTTPS secure wala hai". Controlled training exercise ke pen-test summary mein HTTP rule training pattern ko pass karta dikha. Admin ne log check kiya, Allow dekha aur koi situation nahi, HTTP rule kholkar flag off dekha, theek kiya aur install kiya. Retest mein situation EXPLOIT-TEST ke saath Terminate dikha.</p><p><b>Lesson:</b> us rule par flag lagao jo sach mein woh traffic le jaata hai jiski aapko chinta hai, aur log line se prove karo.</p></div>

<div class="iv"><p class="q">"Server firewall ke peeche hai, IPS policy configured hai, phir bhi attack pattern nikal gaya. Pehle kya check karoge?"</p><p>Strong answer: connection ko kaunsa Access rule match hua, us rule par deep inspection flag hai ya nahi, Inspection policy mein deep inspection active hai ya nahi, HTTPS decrypt hua ya nahi, aur policy install hui ya nahi. Phir log mein situation padho. Batao ki aap chalane ke liye rule ko broad Allow nahi banate.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Deep inspection har rule ka flag hai, global switch nahi.</li>
<li>Akela Access rule sirf allow ya block karta hai; content kabhi nahi padhta.</li>
<li>Risky traffic wale rules ko flag do: exposed servers aur user web access.</li>
<li>Inspection act kare to log mein Terminate aur situation dikhta hai.</li>
<li>Install policy karo, phir ek bad aur ek normal request dono retest karo.</li>
</ul></div>
`}};export{e as default};