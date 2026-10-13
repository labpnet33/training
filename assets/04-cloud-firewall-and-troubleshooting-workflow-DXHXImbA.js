var e={id:`cloud-firewall-and-troubleshooting-workflow`,h:{en:`Cloud firewall and the troubleshooting workflow`,hi:`Cloud firewall aur troubleshooting workflow`},body:{en:`
<h3>Not everything is a web page</h3>
<p>So far we met web traffic only. But people also use SSH to manage servers, remote desktop to reach Windows machines, DNS to resolve names. None of this is a browser request, so URL filtering, DLP and the sandbox do not apply. The <b>cloud firewall</b> is the stage for this non-web traffic. It looks at <b>protocol, destination and port</b>, not at web content. Think of it as the road barrier: it checks the vehicle type and the lane, not what is inside the boot.</p>

<h3>How the rules work</h3>
<p>Cloud firewall rules are ordered, first match wins, and if nothing matches the <b>default</b> applies. In the simulator the default is <b>allow</b>. The seed rules block tcp 22 (SSH) and tcp 3389 (remote desktop) and allow udp 53 (DNS). Fields: users or groups, locations, protocol, ports, action.</p>
<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="Cloud firewall decision">
<rect x="10" y="50" width="110" height="60" rx="8" fill="#bae6fd"/><text x="65" y="85" text-anchor="middle" class="svg-ink" font-size="13">Client / site</text>
<rect x="190" y="30" width="260" height="100" rx="8" fill="#ddd6fe"/><text x="320" y="55" text-anchor="middle" class="svg-ink" font-size="13">Cloud firewall</text><text x="320" y="78" text-anchor="middle" class="svg-ink" font-size="12">1 allow ssh Engineering</text><text x="320" y="96" text-anchor="middle" class="svg-ink" font-size="12">2 block ssh any</text><text x="320" y="114" text-anchor="middle" class="svg-muted" font-size="12">default: allow</text>
<rect x="520" y="50" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="575" y="78" text-anchor="middle" class="svg-ink" font-size="13">203.0.113.200</text><text x="575" y="96" text-anchor="middle" class="svg-muted" font-size="11">test server</text>
<line x1="120" y1="80" x2="190" y2="80" stroke="#64748b" stroke-width="2"/><line x1="450" y1="80" x2="520" y2="80" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Order again: the narrow allow sits above the broad block.</p></div>
<p>Non-web traffic reaches the cloud firewall only over a tunnel or the client connector. A site using a PAC file sends just browser traffic to the proxy; its non-web traffic goes direct, and if the edge firewall forbids direct internet it simply fails. That is a forwarding issue, covered in zs-fwd.</p>
<pre class="out">C:\\&gt; nc -z 203.0.113.200 22
<span class="hl">Result: BLOCKED  cloud firewall rule: Block-ssh</span>
C:\\&gt; nc -z 203.0.113.200 443
Result: open (default allow)
C:\\&gt; nc -zu 203.0.113.200 53
Result: open  rule: Allow-dns</pre>
<p>Note the second line: tcp 443 is allowed only because the default is allow. A stricter design ends with an explicit deny, but then every needed service needs a rule. This is a trade-off you should be able to explain.</p>

<h3>Ticket 320100: SSH only for Engineering</h3>
<p>Request: let Engineering use SSH, keep it blocked for others. Evidence: vikram (Engineering) fails to connect, the seed rule Block-ssh decides. Naive fix: add Allow-ssh-Engineering at the <i>bottom</i>. It never fires, because Block-ssh matches first. Correct fix: place it <b>above</b> Block-ssh, with group Engineering and tcp 22. Verify with two users: vikram open, ravi (Finance) still BLOCKED. Always test the allowed and the denied case.</p>

<div class="note"><p><b>What does this change on the wire/policy?</b> A cloud firewall rule decides whether a new connection or packet from the tunnel or client path is forwarded or dropped. It does not change DNS, routing or the tunnel itself. If the user is not identified at that location, a rule naming a group cannot match.</p></div>

<h3>The troubleshooting workflow</h3>
<p>Every ticket in this module is solved with five steps: <b>symptom</b> (what exactly fails, for whom, where), <b>evidence</b> (Policy tester, logs, client commands), <b>root cause</b> (the single deciding rule or missing item), <b>fix</b> (smallest change), <b>verify</b> (positive and negative test, then check the audit log shows your change).</p>
<table class="cmp"><tr><th>Case</th><th>Evidence</th><th>Root cause</th><th>Fix</th></tr>
<tr><td>Lab zs-sec-4, update.pinned.example fails with 495</td><td>Tester: Inspect-all decides</td><td>pinned app, no skip rule</td><td>skip rule above Inspect-all</td></tr>
<tr><td>Ticket 320010, every site warns</td><td>unknown issuer, one PC</td><td>root not installed</td><td>install the root</td></tr>
<tr><td>Ticket 321060, card leaks</td><td>SSL decision skip</td><td>skip on File sharing</td><td>narrow skip</td></tr>
<tr><td>Ticket 320020, CRM blocked</td><td>category rule decides</td><td>rule too broad</td><td>narrow or reorder</td></tr></table>
<p>Lab zs-sec-3 practises DLP and the firewall together; lab zs-sec-2 builds the SSL rules with exceptions.</p>
<p><b>MSS aside (ticket 320090).</b> Small pages load but large downloads hang. This is not a security rule: policy would show an answer. The tunnel carries packets with extra headers, so full-size packets may not fit; clamping the TCP segment size on the edge fixes it. Lesson: if the Policy tester says ALLOWED yet big transfers stall, think packet size, not policy.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Adding the exception at the bottom. (2) Testing only the allowed user. (3) Editing three rules at once, then not knowing which one fixed it. (4) Blaming policy for a size problem.</p></div>
<div class="exam"><p><b>Exam trap.</b> Cloud firewall default is allow in this simulator; "no rule" does not mean blocked.</p></div>

<div class="scn"><h4>One rule moved up, two engineers happy</h4><p>The infrastructure team could not SSH to a test server after a security hardening. The engineer read the firewall list, saw the broad block above everything, inserted a narrow allow for Engineering above it, tested with an engineer and a finance user, and closed the ticket in ten minutes.</p><p><b>Lesson:</b> position is part of the rule.</p></div>

<div class="iv"><p class="q">"What is a cloud firewall and how is it different from URL filtering?"</p><p>Cloud firewall controls non-web traffic by protocol, destination and port, with ordered rules and a default. URL filtering works on web requests by host, category and path. Mention that deep content stages need inspection and the firewall does not look at content.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The cloud firewall handles non-web traffic by protocol and port.</li>
<li>Ordered rules, first match wins, default allow in the simulator.</li>
<li>Narrow allows go above broad blocks.</li>
<li>Use symptom, evidence, root cause, fix, verify every time.</li>
<li>Large transfers stalling with an ALLOWED result suggests MSS, not policy.</li>
</ul></div>
`,hi:`
<h3>Sab kuch web page nahi hota</h3>
<p>Ab tak humne sirf web traffic dekha. Lekin log servers manage karne ke liye SSH, Windows machines tak pahunchne ke liye remote desktop, aur names resolve karne ke liye DNS bhi use karte hain. Yeh sab browser request nahi hai, isliye URL filtering, DLP aur sandbox lagu nahi hote. <b>Cloud firewall</b> is non-web traffic ka stage hai. Yeh <b>protocol, destination aur port</b> dekhta hai, web content nahi. Ise road barrier samjho: woh gaadi ka type aur lane check karta hai, dikki ke andar kya hai woh nahi.</p>

<h3>Rules kaise kaam karte hain</h3>
<p>Cloud firewall rules ordered hain, first match wins, aur kuch match na ho to <b>default</b> lagta hai. Simulator mein default <b>allow</b> hai. Seed rules tcp 22 (SSH) aur tcp 3389 (remote desktop) block karte hain aur udp 53 (DNS) allow karte hain. Fields: users ya groups, locations, protocol, ports, action.</p>
<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="Cloud firewall ka decision">
<rect x="10" y="50" width="110" height="60" rx="8" fill="#bae6fd"/><text x="65" y="85" text-anchor="middle" class="svg-ink" font-size="13">Client / site</text>
<rect x="190" y="30" width="260" height="100" rx="8" fill="#ddd6fe"/><text x="320" y="55" text-anchor="middle" class="svg-ink" font-size="13">Cloud firewall</text><text x="320" y="78" text-anchor="middle" class="svg-ink" font-size="12">1 allow ssh Engineering</text><text x="320" y="96" text-anchor="middle" class="svg-ink" font-size="12">2 block ssh any</text><text x="320" y="114" text-anchor="middle" class="svg-muted" font-size="12">default: allow</text>
<rect x="520" y="50" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="575" y="78" text-anchor="middle" class="svg-ink" font-size="13">203.0.113.200</text><text x="575" y="96" text-anchor="middle" class="svg-muted" font-size="11">test server</text>
<line x1="120" y1="80" x2="190" y2="80" stroke="#64748b" stroke-width="2"/><line x1="450" y1="80" x2="520" y2="80" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Order phir se: narrow allow broad block ke upar baithta hai.</p></div>
<p>Non-web traffic cloud firewall tak sirf tunnel ya client connector se pahunchta hai. PAC file wali site sirf browser traffic proxy ko bhejti hai; uska non-web traffic direct jaata hai, aur edge firewall direct internet mana kare to bas fail ho jaata hai. Yeh forwarding ka issue hai, zs-fwd mein cover hua.</p>
<pre class="out">C:\\&gt; nc -z 203.0.113.200 22
<span class="hl">Result: BLOCKED  cloud firewall rule: Block-ssh</span>
C:\\&gt; nc -z 203.0.113.200 443
Result: open (default allow)
C:\\&gt; nc -zu 203.0.113.200 53
Result: open  rule: Allow-dns</pre>
<p>Doosri line dekho: tcp 443 sirf isliye allowed hai kyunki default allow hai. Zyada strict design explicit deny par khatam hota hai, lekin phir har zaroori service ke liye rule chahiye. Yeh trade-off aap explain kar paane chahiye.</p>

<h3>Ticket 320100: SSH sirf Engineering ke liye</h3>
<p>Request: Engineering ko SSH use karne do, baaki ke liye block rakho. Evidence: vikram (Engineering) connect nahi kar pa raha, seed rule Block-ssh decide kar raha hai. Naive fix: Allow-ssh-Engineering ko <i>sabse neeche</i> add karna. Woh kabhi fire nahi hota, kyunki Block-ssh pehle match karta hai. Sahi fix: use Block-ssh ke <b>upar</b> rakho, group Engineering aur tcp 22 ke saath. Do users se verify karo: vikram open, ravi (Finance) abhi bhi BLOCKED. Hamesha allowed aur denied dono case test karo.</p>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Cloud firewall rule decide karta hai ki tunnel ya client path se aane wala naya connection ya packet forward hoga ya drop. Yeh DNS, routing ya tunnel ko nahi badalta. Us location par user identify na ho to group wala rule match nahi kar sakta.</p></div>

<h3>Troubleshooting workflow</h3>
<p>Is module ka har ticket paanch steps se solve hota hai: <b>symptom</b> (kya fail ho raha hai, kiske liye, kahan), <b>evidence</b> (Policy tester, logs, client commands), <b>root cause</b> (ek deciding rule ya missing cheez), <b>fix</b> (sabse chhota change), <b>verify</b> (positive aur negative test, phir audit log mein apna change dekho).</p>
<table class="cmp"><tr><th>Case</th><th>Evidence</th><th>Root cause</th><th>Fix</th></tr>
<tr><td>Lab zs-sec-4, update.pinned.example 495 ke saath fail</td><td>Tester: Inspect-all decide karta hai</td><td>pinned app, skip rule nahi</td><td>Inspect-all ke upar skip rule</td></tr>
<tr><td>Ticket 320010, har site warn karti hai</td><td>unknown issuer, ek PC</td><td>root install nahi</td><td>root install karo</td></tr>
<tr><td>Ticket 321060, card leak</td><td>SSL decision skip</td><td>File sharing par skip</td><td>skip narrow karo</td></tr>
<tr><td>Ticket 320020, CRM blocked</td><td>category rule decide karta hai</td><td>rule bahut broad</td><td>narrow ya reorder</td></tr></table>
<p>Lab zs-sec-3 DLP aur firewall ek saath practise karata hai; lab zs-sec-2 exceptions ke saath SSL rules banata hai.</p>
<p><b>MSS aside (ticket 320090).</b> Chhote pages load hote hain lekin bade downloads hang ho jaate hain. Yeh security rule nahi hai: policy ka koi jawab dikhta. Tunnel extra headers ke saath packets le jaata hai, isliye full-size packets fit nahi hote; edge par TCP segment size clamp karne se theek hota hai. Seekh: Policy tester ALLOWED kahe aur bade transfers atke to packet size socho, policy nahi.</p>

<div class="warn"><p><b>Common galtiyan.</b> (1) Exception ko sabse neeche add karna. (2) Sirf allowed user ko test karna. (3) Teen rules ek saath edit karna aur phir pata na chalna ki kisne fix kiya. (4) Size problem ke liye policy ko blame karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Is simulator mein cloud firewall ka default allow hai; "no rule" ka matlab blocked nahi.</p></div>

<div class="scn"><h4>Ek rule upar gaya, do engineers khush</h4><p>Security hardening ke baad infrastructure team test server par SSH nahi kar pa rahi thi. Engineer ne firewall list padhi, sabse upar broad block dekha, uske upar Engineering ke liye narrow allow daala, ek engineer aur ek finance user se test kiya, aur ticket das minute mein close kiya.</p><p><b>Seekh:</b> position bhi rule ka hissa hai.</p></div>

<div class="iv"><p class="q">"Cloud firewall kya hai aur URL filtering se kaise alag hai?"</p><p>Cloud firewall non-web traffic ko protocol, destination aur port se control karta hai, ordered rules aur default ke saath. URL filtering web requests par host, category aur path se kaam karti hai. Mention karo ki deep content stages ko inspection chahiye aur firewall content nahi dekhta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Cloud firewall non-web traffic ko protocol aur port se handle karta hai.</li>
<li>Ordered rules, first match wins, simulator mein default allow.</li>
<li>Narrow allows broad blocks ke upar jaate hain.</li>
<li>Har baar symptom, evidence, root cause, fix, verify use karo.</li>
<li>ALLOWED result ke saath bade transfers atkna MSS ki taraf ishara hai, policy ki nahi.</li>
</ul></div>
`}};export{e as default};