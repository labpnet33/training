var e={id:`intrusion-policies`,h:{en:`Intrusion policies: rules, base policies, actions and Talos updates`,hi:`Intrusion policies: rules, base policies, actions aur Talos updates`},body:{en:`
<p>An airport X-ray operator has a binder of pictures: this shape is a knife, this one a gun, this one a harmless hair dryer that only looks suspicious. For each picture the binder says what to do: stop the bag, call a supervisor, or ignore it. The binder is updated every week as new threats appear. In Threat Defense the pictures are <b>intrusion rules</b> written by Cisco Talos, the binder with its instructions is the <b>intrusion policy</b>, and the weekly update is the <b>Talos rule update</b>. Your job is not to write the pictures; it is to choose a sensible binder and adjust the few instructions that do not fit your network.</p>

<h3>What an intrusion rule is</h3>
<p>A rule (also called a signature) describes traffic that matches a known attack or a risky behaviour. It has a <b>header</b> (protocol, source and destination networks and ports) and <b>options</b> (where to look and what to look for). Here is a simplified rule that matches only the lab's simulated marker:</p>
<pre class="code"><span class="c">! Snort 3 rule format (simulated marker, for reading practice)</span>
alert tcp $EXTERNAL_NET any -&gt; $HTTP_SERVERS $HTTP_PORTS (
    msg:"SERVER-WEBAPP SQL injection attempt (nk-sim)";
    flow:to_server,established;
    h&#116;tp_uri; content:"nk-sim=sqli",nocase;
    service:h&#116;tp;
    classtype:web-application-attack;
    gid:1; sid:58001; rev:1; )</pre>
<dl class="terms">
<dt>GID:SID:REV</dt><dd>Generator ID, Snort ID and revision. Talos text rules use GID 1; shared-object rules use GID 3; rules built into inspectors use their own GIDs (for example 119 for the HTTP inspector). Custom rules you upload get their own range. Always quote rules as GID:SID, for example <b>1:58001</b>.</dd>
<dt>msg and rule group</dt><dd>The message starts with a group such as SERVER-WEBAPP, MALWARE-CNC, POLICY-OTHER, INDICATOR-SCAN, BROWSER-IE. POLICY rules flag risky behaviour, not necessarily an attack.</dd>
<dt>classtype and priority</dt><dd>The classification (Web Application Attack, A Network Trojan was Detected, Potential Corporate Policy Violation) sets a default priority: 1 high, 2 medium, 3 low.</dd>
<dt>Variables</dt><dd><code>$HOME_NET</code>, <code>$EXTERNAL_NET</code>, <code>$HTTP_SERVERS</code>, <code>$HTTP_PORTS</code> are filled from the <b>variable set</b> (next chapter).</dd>
</dl>

<h3>Rule actions</h3>
<p>The intrusion policy gives every rule an action. Snort 3 policies in the Management Center use these names; the older Snort 2 names are in brackets, and our lab GUI uses the older ones.</p>
<table class="cmp"><tr><th>Action</th><th>Effect</th></tr>
<tr><td>Alert (Generate Events)</td><td>log an intrusion event, do not drop</td></tr>
<tr><td>Block (Drop and Generate Events)</td><td>drop the packet and the rest of the session, log</td></tr>
<tr><td>Drop</td><td>drop only the matching packet, log</td></tr>
<tr><td>Reject</td><td>drop and send a TCP reset or ICMP unreachable</td></tr>
<tr><td>Rewrite</td><td>replace content as the rule specifies</td></tr>
<tr><td>Pass</td><td>ignore matches of this rule for the packet</td></tr>
<tr><td>Disable (Disabled)</td><td>rule not evaluated</td></tr></table>
<p>Dropping also depends on the <b>inspection mode</b> of the policy: <b>Prevention</b> drops; <b>Detection</b> never drops and marks events "Would have dropped". And the interface must be able to drop: a routed or inline interface can, a passive interface cannot (sec-fw-deploy).</p>

<h3>Base policies and overrides</h3>
<p>Nobody sets 50,000 rules by hand. You create a policy from a Talos <b>base policy</b> and change only what you must. Your changes are <b>overrides</b> layered on top; when Talos updates the base, your overrides survive.</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Base policies from fewer to more rules">
<rect x="20" y="50" width="140" height="70" rx="8" fill="#bbf7d0"/><text x="90" y="76" text-anchor="middle" class="svg-ink" font-size="12">Connectivity</text><text x="90" y="92" text-anchor="middle" class="svg-ink" font-size="12">Over Security</text><text x="90" y="110" text-anchor="middle" class="svg-muted" font-size="12">fewest rules</text>
<rect x="175" y="50" width="140" height="70" rx="8" fill="#bae6fd"/><text x="245" y="76" text-anchor="middle" class="svg-ink" font-size="12">Balanced Security</text><text x="245" y="92" text-anchor="middle" class="svg-ink" font-size="12">and Connectivity</text><text x="245" y="110" text-anchor="middle" class="svg-muted" font-size="12">usual default</text>
<rect x="330" y="50" width="140" height="70" rx="8" fill="#fde68a"/><text x="400" y="76" text-anchor="middle" class="svg-ink" font-size="12">Security Over</text><text x="400" y="92" text-anchor="middle" class="svg-ink" font-size="12">Connectivity</text><text x="400" y="110" text-anchor="middle" class="svg-muted" font-size="12">more drops</text>
<rect x="485" y="50" width="140" height="70" rx="8" fill="#fed7aa"/><text x="555" y="76" text-anchor="middle" class="svg-ink" font-size="12">Maximum</text><text x="555" y="92" text-anchor="middle" class="svg-ink" font-size="12">Detection</text><text x="555" y="110" text-anchor="middle" class="svg-muted" font-size="12">labs, testing</text>
<line x1="20" y1="160" x2="625" y2="160" stroke="#64748b" stroke-width="2"/><polygon points="625,160 613,154 613,166" fill="#64748b"/>
<text x="320" y="185" text-anchor="middle" class="svg-accent" font-size="12">more rules = more protection, more CPU, more false positives</text>
<text x="320" y="210" text-anchor="middle" class="svg-muted" font-size="12">Snort 3 rule groups use security levels 1 to 4 behind these names</text>
</svg><p class="cap">Pick the base that matches the risk of the segment, then override individual rules.</p></div>
<p>There is also <b>No Rules Active</b>, used when you want to build a policy entirely yourself. In Snort 3 policies, rules are organised in <b>rule groups</b> (for example Server, Malware, Policy) with a <b>security level</b> from 1 to 4; raising the level of one group enables more of its rules without touching the others.</p>

<h3>Talos rule updates</h3>
<p>Talos publishes new and changed rules several times a week. For Snort 3 they arrive as an <b>LSP</b> (Lightweight Security Package); Snort 2 used <b>SRUs</b>. In the Management Center, System, Updates, Rule Updates, schedule a recurring import and choose whether updated policies are deployed automatically. Application detectors come separately in the <b>VDB</b>, and geolocation data in its own update.</p>

<h3>Lab walkthrough: intrusion policy in front of the published web server</h3>
<pre class="code"><span class="c">! 1. Prove the gap: PARTNER sends the simulated attack, it reaches WEB</span>
PARTNER&gt; curl web.nwk.example/products?nk-sim=sqli
<span class="c">! 2. Policies &gt; Intrusion &gt; Create Policy</span>
Name: NK-WEB-IPS   Inspection Mode: Prevention   Base Policy: Balanced Security and Connectivity
<span class="c">! 3. Policies &gt; Access Control &gt; NK-ACP &gt; edit Web-In &gt; Inspection</span>
Intrusion Policy: NK-WEB-IPS   Variable Set: Default-Set
Deploy</pre>
<pre class="out">PARTNER&gt; curl web.nwk.example/products?nk-sim=sqli
<span class="hl">curl: (28) Operation timed out after 5001 milliseconds with 0 bytes received</span>
PARTNER&gt; curl web.nwk.example/products
&lt;html&gt;&lt;body&gt;&lt;h1&gt;MyPnetLab web portal&lt;/h1&gt;...

Analysis &gt; Intrusions &gt; Events
Priority  Impact  Inline Result  Source          Destination  Port  GID:SID   Message
high      1       <span class="hl">Dropped</span>        198.51.100.10   10.0.2.10    80    <span class="hl">1:58001</span>   SERVER-WEBAPP SQL injection attempt (nk-sim)</pre>
<p>The destination in the event is the <b>real</b> address 10.0.2.10, because NAT untranslation happens in LINA before Snort inspects. The lab answer is SID <b>58001</b>.</p>

<div class="eg"><p><b>Worked example: choosing bases per segment.</b> NK uses three intrusion policies: <b>NK-WEB-IPS</b> (Balanced) on Web-In for the public web server, <b>NK-DC-IPS</b> (Security Over Connectivity) between users and the data centre, where outages are rarer than breaches, and <b>NK-GUEST-IPS</b> (Connectivity Over Security) on the guest Wi-Fi, where speed matters and assets are not at risk. Each is a different policy attached to different access control rules.</p></div>

<div class="warn"><p><b>Common mistake.</b> Creating an intrusion policy but never attaching it to an Allow rule, or attaching it to a Trust rule. The policy then inspects nothing. Check the rule's Inspection tab and look for intrusion events after a test.</p></div>

<div class="exam"><p><b>Exam trap.</b> Detection mode or a passive interface means "Would have dropped", never a real drop. A rule set to Alert never drops even in Prevention mode. Overrides survive base policy updates; editing the base itself is not possible.</p></div>

<div class="scn"><h4>The weekly update that blocked a scanner</h4><p>Monday morning, the company's vulnerability scanner reported half its targets unreachable. Over the weekend an automatic LSP had enabled a new INDICATOR-SCAN rule in the Balanced base. The intrusion events showed the scanner at 10.0.3.5 dropped by that SID. The team did not disable the rule; they created a narrow exception for the scanner's source address only and documented it.</p><p><b>Lesson:</b> automatic rule updates change behaviour; review intrusion events after every update.</p></div>

<div class="iv"><p class="q">"What is a base policy, and how would you choose one?"</p><p>A base policy is a Talos-maintained starting set of rule actions: Connectivity Over Security, Balanced Security and Connectivity, Security Over Connectivity, Maximum Detection, or No Rules Active. You pick it by the segment's risk and tolerance for false positives, usually Balanced, then apply overrides for individual rules or raise rule group security levels. Overrides survive Talos LSP updates. Mention inspection mode Prevention versus Detection and that the policy only works on Allow rules.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Rules are identified by GID:SID; the message group (SERVER-WEBAPP, MALWARE-CNC, POLICY) tells you what kind they are.</li>
<li>Actions: Alert, Block, Drop, Reject, Rewrite, Pass, Disable (older: Generate Events, Drop and Generate Events, Disabled).</li>
<li>Start from a Talos base policy, usually Balanced, and override only what you must.</li>
<li>Prevention drops; Detection and passive interfaces only log "Would have dropped".</li>
<li>Talos LSP updates arrive regularly; your overrides survive them.</li>
</ul></div>
`,hi:`
<p>Airport X-ray operator ke paas tasveeron ki ek binder hoti hai: yeh shape chaaku hai, yeh bandook, yeh ek harmless hair dryer jo bas suspicious dikhta hai. Har tasveer ke liye binder batati hai kya karna hai: bag roko, supervisor ko bulao, ya ignore karo. Naye threats aane par binder har hafte update hoti hai. Threat Defense mein tasveerein Cisco Talos ki likhi <b>intrusion rules</b> hain, instructions wali binder <b>intrusion policy</b> hai, aur weekly update <b>Talos rule update</b> hai. Aapka kaam tasveerein likhna nahi; aapka kaam samajhdaar binder chunna aur woh kuch instructions adjust karna hai jo aapke network mein fit nahi hoti.</p>

<h3>Intrusion rule kya hai</h3>
<p>Rule (jise signature bhi kehte hain) aise traffic ko describe karti hai jo kisi known attack ya risky behaviour se match karta hai. Iska ek <b>header</b> hota hai (protocol, source aur destination networks aur ports) aur <b>options</b> (kahan dekhna hai aur kya dhoondhna hai). Yeh ek simplified rule hai jo sirf lab ke simulated marker ko match karti hai:</p>
<pre class="code"><span class="c">! Snort 3 rule format (simulated marker, padhne ki practice ke liye)</span>
alert tcp $EXTERNAL_NET any -&gt; $HTTP_SERVERS $HTTP_PORTS (
    msg:"SERVER-WEBAPP SQL injection attempt (nk-sim)";
    flow:to_server,established;
    h&#116;tp_uri; content:"nk-sim=sqli",nocase;
    service:h&#116;tp;
    classtype:web-application-attack;
    gid:1; sid:58001; rev:1; )</pre>
<dl class="terms">
<dt>GID:SID:REV</dt><dd>Generator ID, Snort ID aur revision. Talos text rules GID 1 use karti hain; shared-object rules GID 3; inspectors mein built-in rules apne GIDs (jaise HTTP inspector ke liye 119). Aapki upload ki hui custom rules ko apni range milti hai. Rules ko hamesha GID:SID ki tarah bolo, jaise <b>1:58001</b>.</dd>
<dt>msg aur rule group</dt><dd>Message ek group se shuru hota hai jaise SERVER-WEBAPP, MALWARE-CNC, POLICY-OTHER, INDICATOR-SCAN, BROWSER-IE. POLICY rules risky behaviour flag karti hain, zaroori nahi ki attack ho.</dd>
<dt>classtype aur priority</dt><dd>Classification (Web Application Attack, A Network Trojan was Detected, Potential Corporate Policy Violation) default priority set karti hai: 1 high, 2 medium, 3 low.</dd>
<dt>Variables</dt><dd><code>$HOME_NET</code>, <code>$EXTERNAL_NET</code>, <code>$HTTP_SERVERS</code>, <code>$HTTP_PORTS</code> <b>variable set</b> se bharte hain (agla chapter).</dd>
</dl>

<h3>Rule actions</h3>
<p>Intrusion policy har rule ko ek action deti hai. Management Center mein Snort 3 policies yeh naam use karti hain; purane Snort 2 naam brackets mein hain, aur hamara lab GUI purane naam use karta hai.</p>
<table class="cmp"><tr><th>Action</th><th>Asar</th></tr>
<tr><td>Alert (Generate Events)</td><td>intrusion event log karo, drop nahi</td></tr>
<tr><td>Block (Drop and Generate Events)</td><td>packet aur baaki session drop, log</td></tr>
<tr><td>Drop</td><td>sirf matching packet drop, log</td></tr>
<tr><td>Reject</td><td>drop karke TCP reset ya ICMP unreachable bhejo</td></tr>
<tr><td>Rewrite</td><td>rule ke hisaab se content replace karo</td></tr>
<tr><td>Pass</td><td>packet ke liye is rule ke matches ignore karo</td></tr>
<tr><td>Disable (Disabled)</td><td>rule evaluate nahi hoti</td></tr></table>
<p>Drop karna policy ke <b>inspection mode</b> par bhi depend karta hai: <b>Prevention</b> drop karta hai; <b>Detection</b> kabhi drop nahi karta aur events ko "Would have dropped" mark karta hai. Aur interface drop kar sakne layak hona chahiye: routed ya inline interface kar sakta hai, passive interface nahi (sec-fw-deploy).</p>

<h3>Base policies aur overrides</h3>
<p>Koi bhi 50,000 rules haath se set nahi karta. Aap Talos <b>base policy</b> se policy banate ho aur sirf zaroori cheez badalte ho. Aapke changes upar layered <b>overrides</b> hain; jab Talos base update karta hai, aapke overrides bache rehte hain.</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Kam se zyada rules wali base policies">
<rect x="20" y="50" width="140" height="70" rx="8" fill="#bbf7d0"/><text x="90" y="76" text-anchor="middle" class="svg-ink" font-size="12">Connectivity</text><text x="90" y="92" text-anchor="middle" class="svg-ink" font-size="12">Over Security</text><text x="90" y="110" text-anchor="middle" class="svg-muted" font-size="12">sabse kam rules</text>
<rect x="175" y="50" width="140" height="70" rx="8" fill="#bae6fd"/><text x="245" y="76" text-anchor="middle" class="svg-ink" font-size="12">Balanced Security</text><text x="245" y="92" text-anchor="middle" class="svg-ink" font-size="12">and Connectivity</text><text x="245" y="110" text-anchor="middle" class="svg-muted" font-size="12">aam default</text>
<rect x="330" y="50" width="140" height="70" rx="8" fill="#fde68a"/><text x="400" y="76" text-anchor="middle" class="svg-ink" font-size="12">Security Over</text><text x="400" y="92" text-anchor="middle" class="svg-ink" font-size="12">Connectivity</text><text x="400" y="110" text-anchor="middle" class="svg-muted" font-size="12">zyada drops</text>
<rect x="485" y="50" width="140" height="70" rx="8" fill="#fed7aa"/><text x="555" y="76" text-anchor="middle" class="svg-ink" font-size="12">Maximum</text><text x="555" y="92" text-anchor="middle" class="svg-ink" font-size="12">Detection</text><text x="555" y="110" text-anchor="middle" class="svg-muted" font-size="12">labs, testing</text>
<line x1="20" y1="160" x2="625" y2="160" stroke="#64748b" stroke-width="2"/><polygon points="625,160 613,154 613,166" fill="#64748b"/>
<text x="320" y="185" text-anchor="middle" class="svg-accent" font-size="12">zyada rules = zyada protection, zyada CPU, zyada false positives</text>
<text x="320" y="210" text-anchor="middle" class="svg-muted" font-size="12">In naamon ke peeche Snort 3 rule groups security levels 1 se 4 use karte hain</text>
</svg><p class="cap">Segment ke risk se match karti base chuno, phir individual rules override karo.</p></div>
<p><b>No Rules Active</b> bhi hai, jo tab use hoti hai jab aap policy poori khud banana chahte ho. Snort 3 policies mein rules <b>rule groups</b> mein organised hain (jaise Server, Malware, Policy) jinka <b>security level</b> 1 se 4 hota hai; ek group ka level badhane se uski zyada rules enable hoti hain bina baaki ko chhue.</p>

<h3>Talos rule updates</h3>
<p>Talos hafte mein kai baar nayi aur badli hui rules publish karta hai. Snort 3 ke liye yeh <b>LSP</b> (Lightweight Security Package) ki tarah aati hain; Snort 2 <b>SRUs</b> use karta tha. Management Center mein System, Updates, Rule Updates mein recurring import schedule karo aur chuno ki updated policies apne aap deploy hon ya nahi. Application detectors alag se <b>VDB</b> mein aate hain, aur geolocation data apne update mein.</p>

<h3>Lab walkthrough: published web server ke aage intrusion policy</h3>
<pre class="code"><span class="c">! 1. Gap saabit karo: PARTNER simulated attack bhejta hai, woh WEB tak pahunchta hai</span>
PARTNER&gt; curl web.nwk.example/products?nk-sim=sqli
<span class="c">! 2. Policies &gt; Intrusion &gt; Create Policy</span>
Name: NK-WEB-IPS   Inspection Mode: Prevention   Base Policy: Balanced Security and Connectivity
<span class="c">! 3. Policies &gt; Access Control &gt; NK-ACP &gt; Web-In edit karo &gt; Inspection</span>
Intrusion Policy: NK-WEB-IPS   Variable Set: Default-Set
Deploy</pre>
<pre class="out">PARTNER&gt; curl web.nwk.example/products?nk-sim=sqli
<span class="hl">curl: (28) Operation timed out after 5001 milliseconds with 0 bytes received</span>
PARTNER&gt; curl web.nwk.example/products
&lt;html&gt;&lt;body&gt;&lt;h1&gt;MyPnetLab web portal&lt;/h1&gt;...

Analysis &gt; Intrusions &gt; Events
Priority  Impact  Inline Result  Source          Destination  Port  GID:SID   Message
high      1       <span class="hl">Dropped</span>        198.51.100.10   10.0.2.10    80    <span class="hl">1:58001</span>   SERVER-WEBAPP SQL injection attempt (nk-sim)</pre>
<p>Event mein destination <b>real</b> address 10.0.2.10 hai, kyunki NAT untranslation Snort ke inspect karne se pehle LINA mein hota hai. Lab ka jawab SID <b>58001</b> hai.</p>

<div class="eg"><p><b>Worked example: har segment ke liye base chunna.</b> NK teen intrusion policies use karta hai: public web server ke liye Web-In par <b>NK-WEB-IPS</b> (Balanced), users aur data centre ke beech <b>NK-DC-IPS</b> (Security Over Connectivity), jahan outages breaches se kam hote hain, aur guest Wi-Fi par <b>NK-GUEST-IPS</b> (Connectivity Over Security), jahan speed maayne rakhti hai aur assets risk mein nahi. Har ek alag policy hai jo alag access control rules se judi hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Intrusion policy banana lekin use kabhi Allow rule se na jodna, ya Trust rule se jodna. Tab policy kuch inspect nahi karti. Rule ka Inspection tab check karo aur test ke baad intrusion events dekho.</p></div>

<div class="exam"><p><b>Exam trap.</b> Detection mode ya passive interface ka matlab "Would have dropped" hai, kabhi asli drop nahi. Alert par set rule Prevention mode mein bhi kabhi drop nahi karti. Overrides base policy updates ke baad bhi bache rehte hain; base ko khud edit karna possible nahi.</p></div>

<div class="scn"><h4>Weekly update jisne scanner block kiya</h4><p>Somvaar subah company ke vulnerability scanner ne report kiya ki uske aadhe targets unreachable hain. Weekend par ek automatic LSP ne Balanced base mein nayi INDICATOR-SCAN rule enable kar di thi. Intrusion events mein 10.0.3.5 par scanner us SID se dropped tha. Team ne rule disable nahi ki; unhone sirf scanner ke source address ke liye narrow exception banaya aur document kiya.</p><p><b>Lesson:</b> automatic rule updates behaviour badalte hain; har update ke baad intrusion events review karo.</p></div>

<div class="iv"><p class="q">"Base policy kya hai, aur aap ise kaise chunoge?"</p><p>Base policy Talos ka maintain kiya rule actions ka starting set hai: Connectivity Over Security, Balanced Security and Connectivity, Security Over Connectivity, Maximum Detection, ya No Rules Active. Aap ise segment ke risk aur false positives ki sehen-shakti se chunte ho, aam taur par Balanced, phir individual rules ke liye overrides lagate ho ya rule group security levels badhate ho. Overrides Talos LSP updates ke baad bache rehte hain. Inspection mode Prevention vs Detection batao aur yeh ki policy sirf Allow rules par kaam karti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Rules GID:SID se pehchani jaati hain; message group (SERVER-WEBAPP, MALWARE-CNC, POLICY) batata hai woh kis type ki hain.</li>
<li>Actions: Alert, Block, Drop, Reject, Rewrite, Pass, Disable (purane: Generate Events, Drop and Generate Events, Disabled).</li>
<li>Talos base policy se shuru karo, aam taur par Balanced, aur sirf zaroori cheez override karo.</li>
<li>Prevention drop karta hai; Detection aur passive interfaces sirf "Would have dropped" log karte hain.</li>
<li>Talos LSP updates regular aate hain; aapke overrides unke baad bhi bache rehte hain.</li>
</ul></div>
`}};export{e as default};