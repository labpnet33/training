var e={id:`reading-a-report`,h:{en:`Reading a report correctly`,hi:`Report ko sahi tarah padhna`},body:{en:`
<p>A school report card shows marks, but a careful parent also reads the fine print: out of how many, which term, which class. A report from FAZ-1 is the same. The numbers are only true for the scope printed in the first two lines. This chapter teaches you to read those lines first, then the totals, then the top lists, and to avoid three classic misreadings: sessions versus bytes, "blocked" versus "denied", and top lists that look like totals.</p>

<h3>Step 1: read the header and the basis line</h3>
<p>Every report starts with the layout, the <b>ADOM</b> and the device. The second line says <code>Based on N stored analytics logs</code> and splits N into traffic, UTM and event logs. This is your evidence base. If N is small or zero, nothing below it is reliable.</p>

<h3>Step 2: sessions versus bytes</h3>
<p>A <b>session</b> is one conversation through the firewall, written as one traffic log. <b>Bytes</b> are the amount of data in the byte fields of those logs. Sessions tell you how often something happens; bytes tell you how heavy it is. One video call can be one session and a million bytes; one hundred tiny page loads can be one hundred sessions and little data. Choose the measure that fits the question: the number of sessions for activity and policy, bytes for link capacity.</p>
<p>In the simulator the bytes are a <b>stand-in</b>: the firewall writes 84 sent bytes in every traffic log. So bytes equal sessions multiplied by 84, and the simulator can never show a heavy download. Treat the byte column as a way to learn the layout, not as a measurement.</p>

<h3>Step 3: blocked versus denied</h3>
<p>Two different things get confused. <b>Deny</b> is the firewall policy action: no policy accepted the traffic, or a policy rejected it. <b>Blocked</b> in the Traffic Report is wider: a deny, or a session that was allowed by the policy but then stopped by a security profile, for example application control. Such a session still shows as <code>accept</code> in the per-action line, because the policy accepted it before the profile blocked it.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Accept, deny and blocked">
<rect x="20" y="20" width="600" height="150" rx="10" fill="#e2e8f0"/>
<text x="40" y="44" class="svg-ink" font-size="13">7 sessions in the Traffic Report</text>
<rect x="40" y="60" width="330" height="44" rx="6" fill="#bbf7d0"/><text x="205" y="87" text-anchor="middle" class="svg-ink" font-size="12">5 accepted and clean</text>
<rect x="370" y="60" width="150" height="44" rx="6" fill="#fed7aa"/><text x="445" y="87" text-anchor="middle" class="svg-ink" font-size="12">2 accepted, then blocked</text>
<rect x="520" y="60" width="80" height="44" rx="6" fill="#fca5a5"/><text x="560" y="87" text-anchor="middle" class="svg-ink" font-size="12">0 deny</text>
<text x="40" y="132" class="svg-muted" font-size="12">Per action: accept=7   Blocked: 2   deny=0</text>
<text x="40" y="152" class="svg-accent" font-size="12">Blocked counts the orange and the red boxes together.</text>
</svg><p class="cap">Accepted sessions can still be blocked by a security profile.</p></div>

<h3>Step 4: read the top lists as rankings</h3>
<p>Lines such as <code>Top applications</code> are rankings with counts in brackets. They show the order and the size of the leaders, not the total. If the list has two entries, those two are everything that was identified; if a list is long, the report shows only the first part. Compare the leader with the total sessions to see its share.</p>

<div class="eg"><p><b>Worked example.</b> The Traffic Report for TRY-FGT says Sessions 7, Blocked 2, top application the browser with 5 and BitTorrent with 2. Share of file sharing: 2 out of 7, about 29 percent of sessions. Bytes are 588, which is 7 times 84, so the byte numbers add nothing here. The honest sentence for the manager is: "Two of seven sessions were file sharing, and both were stopped by the application control list."</p></div>

<h3>Real output to read</h3>
<pre class="out">Report: Traffic Report   ADOM: root   Device: TRY-FGT
<span class="hl">Based on 9 stored analytics logs (7 traffic, 2 utm, 0 event).</span>
<span class="hl">Sessions: 7   Bytes: 588   Blocked: 2</span>
Per action: accept=7
Top sources:
  1. 10.30.0.10  (7)
Top applications:
  1. H&#84;TP.BROWSER  (5)
  2. BitTorrent  (2)</pre>
<p>Read it in order: the scope is root and TRY-FGT; nine logs are the basis (seven traffic and two UTM); there are seven sessions; two are blocked although all seven were accepted by the policy; one source address, 10.30.0.10, made all of them.</p>

<h3>The command is the same, the scope is yours</h3>
<pre class="code"><span class="c">! one device</span>
FAZ-1 # execute fazui report run root TRY-FGT "Traffic Report"
<span class="c">! all devices of the ADOM</span>
FAZ-1 # execute fazui report run root - "Traffic Report"</pre>

<div class="warn"><p><b>Common mistakes.</b> Reading Blocked as "number of deny logs". Quoting bytes from the simulator as real traffic volume. Comparing two reports that have different devices or ADOMs. Forgetting that a top list shows only the identified applications.</p></div>

<div class="exam"><p><b>Exam traps.</b> Per action can say accept=7 while Blocked is 2. Sessions come from traffic logs; threat events come from UTM logs. The 84 bytes per traffic log is a simulator stand-in, not a product rule.</p></div>

<div class="scn"><h4>"Why does the report say blocked when all sessions were accepted?"</h4><p>An auditor read Per action: accept=7 and Blocked: 2 and thought the report was wrong. The engineer opened Log View for the two sessions and showed that utmaction was block on both, with the application BitTorrent. The policy accepted the sessions, then the application control profile blocked them. The report was correct; the auditor had read deny as the only kind of block.</p><p><b>Lesson:</b> explain blocked as policy deny plus profile verdicts, and keep one Log View example ready.</p></div>

<div class="iv"><p class="q">"A report shows 7 sessions and 2 blocked, but no deny. How is that possible?"</p><p>Blocked includes sessions that the policy accepted and a security profile, such as application control, stopped. The traffic log keeps action accept with a block verdict in the UTM action. Mention that you would confirm with a Log View filter on the utmaction field.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Read ADOM, device and the "Based on N logs" line before any number.</li>
<li>Sessions measure activity; bytes measure weight; the simulator bytes are 84 per traffic log.</li>
<li>Blocked means deny or a profile block verdict, so it can exceed the deny count.</li>
<li>Top lists are rankings, not totals.</li>
<li>Confirm a surprising number with a Log View search.</li>
</ul></div>
`,hi:`
<p>School ka report card marks dikhata hai, par samajhdar parent fine print bhi padhta hai: kitne mein se, kaun sa term, kaun si class. FAZ-1 ki report bhi aisi hi hai. Numbers sirf wahi scope ke liye sach hain jo pehli do lines mein chhapa hai. Ye chapter sikhata hai ki pehle wo lines padho, phir totals, phir top lists, aur teen classic galat-padhaiyon se bacho: sessions versus bytes, "blocked" versus "denied", aur top lists jo totals jaisi dikhti hain.</p>

<h3>Step 1: header aur basis line padho</h3>
<p>Har report layout, <b>ADOM</b> aur device se shuru hoti hai. Doosri line kehti hai <code>Based on N stored analytics logs</code> aur N ko traffic, UTM aur event logs mein baantti hai. Ye aapka evidence base hai. Agar N chhota ya zero hai, to uske neeche kuch bharosemand nahi.</p>

<h3>Step 2: sessions versus bytes</h3>
<p><b>Session</b> firewall ke through ek conversation hai, jo ek traffic log ke roop mein likhi jati hai. <b>Bytes</b> un logs ke byte fields mein data ki matra hai. Sessions batate hain ki cheez kitni baar hoti hai; bytes batate hain wo kitni bhaari hai. Ek video call ek session aur das lakh bytes ho sakta hai; sau chhote page loads sau sessions aur kam data. Sawal ke hisaab se measure chuno: activity aur policy ke liye sessions ki sankhya, link capacity ke liye bytes.</p>
<p>Simulator mein bytes ek <b>stand-in</b> hain: firewall har traffic log mein 84 sent bytes likhta hai. Isliye bytes = sessions x 84, aur simulator kabhi heavy download nahi dikha sakta. Byte column ko layout seekhne ka tareeka maano, measurement nahi.</p>

<h3>Step 3: blocked versus denied</h3>
<p>Do alag cheezein confuse hoti hain. <b>Deny</b> firewall policy ka action hai: kisi policy ne traffic accept nahi kiya, ya policy ne reject kiya. Traffic Report ka <b>Blocked</b> bada hai: deny, ya wo session jo policy ne allow kiya par phir security profile ne roka, jaise application control. Aisa session per-action line mein phir bhi <code>accept</code> dikhta hai, kyunki profile ke block karne se pehle policy ne accept kiya tha.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Accept, deny aur blocked">
<rect x="20" y="20" width="600" height="150" rx="10" fill="#e2e8f0"/>
<text x="40" y="44" class="svg-ink" font-size="13">Traffic Report mein 7 sessions</text>
<rect x="40" y="60" width="330" height="44" rx="6" fill="#bbf7d0"/><text x="205" y="87" text-anchor="middle" class="svg-ink" font-size="12">5 accepted, clean</text>
<rect x="370" y="60" width="150" height="44" rx="6" fill="#fed7aa"/><text x="445" y="87" text-anchor="middle" class="svg-ink" font-size="12">2 accepted, phir blocked</text>
<rect x="520" y="60" width="80" height="44" rx="6" fill="#fca5a5"/><text x="560" y="87" text-anchor="middle" class="svg-ink" font-size="12">0 deny</text>
<text x="40" y="132" class="svg-muted" font-size="12">Per action: accept=7   Blocked: 2   deny=0</text>
<text x="40" y="152" class="svg-accent" font-size="12">Blocked orange aur red boxes dono ko milakar ginta hai.</text>
</svg><p class="cap">Accepted sessions ko bhi security profile block kar sakta hai.</p></div>

<h3>Step 4: top lists ko rankings ki tarah padho</h3>
<p><code>Top applications</code> jaisi lines rankings hain jinke bracket mein counts hote hain. Ye leaders ka order aur size dikhati hain, total nahi. Agar list mein do entries hain, to wahi do identify hui everything hain; agar list lambi hai, report sirf shuruaati hissa dikhati hai. Leader ka share dekhne ke liye use total sessions se compare karo.</p>

<div class="eg"><p><b>Worked example.</b> TRY-FGT ka Traffic Report kehta hai Sessions 7, Blocked 2, top application browser 5 aur BitTorrent 2. File sharing ka share: 7 mein se 2, lagbhag 29 percent sessions. Bytes 588 hain, yaani 7 x 84, to byte numbers yahan kuch naya nahi batate. Manager ke liye imaandaar sentence: "Saat mein se do sessions file sharing ke the, aur dono ko application control list ne roka."</p></div>

<h3>Padhne ke liye real output</h3>
<pre class="out">Report: Traffic Report   ADOM: root   Device: TRY-FGT
<span class="hl">Based on 9 stored analytics logs (7 traffic, 2 utm, 0 event).</span>
<span class="hl">Sessions: 7   Bytes: 588   Blocked: 2</span>
Per action: accept=7
Top sources:
  1. 10.30.0.10  (7)
Top applications:
  1. H&#84;TP.BROWSER  (5)
  2. BitTorrent  (2)</pre>
<p>Order mein padho: scope root aur TRY-FGT hai; nau logs basis hain (saat traffic aur do UTM); saat sessions hain; do blocked hain jabki saaton policy ne accept kiye; ek hi source address 10.30.0.10 ne sab kiye.</p>

<h3>Command wahi, scope aapka</h3>
<pre class="code"><span class="c">! ek device</span>
FAZ-1 # execute fazui report run root TRY-FGT "Traffic Report"
<span class="c">! ADOM ke saare devices</span>
FAZ-1 # execute fazui report run root - "Traffic Report"</pre>

<div class="warn"><p><b>Common mistakes.</b> Blocked ko "deny logs ki sankhya" padhna. Simulator ke bytes ko real traffic volume batana. Alag devices ya ADOMs wali do reports ko compare karna. Ye bhoolna ki top list sirf identified applications dikhati hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> Per action accept=7 ho sakta hai jabki Blocked 2 hai. Sessions traffic logs se aate hain; threat events UTM logs se. Har traffic log par 84 bytes simulator stand-in hai, product ka rule nahi.</p></div>

<div class="scn"><h4>"Sab sessions accepted the to report blocked kyun kehti hai?"</h4><p>Ek auditor ne Per action: accept=7 aur Blocked: 2 padha aur socha report galat hai. Engineer ne do sessions ke liye Log View kholi aur dikhaya ki dono mein utmaction block tha, application BitTorrent. Policy ne sessions accept kiye, phir application control profile ne block kiye. Report sahi thi; auditor ne deny ko hi akela block samjha tha.</p><p><b>Lesson:</b> blocked ko policy deny plus profile verdicts bata kar samjhao, aur ek Log View example taiyaar rakho.</p></div>

<div class="iv"><p class="q">"Report mein 7 sessions aur 2 blocked hain, par deny nahi. Ye kaise possible hai?"</p><p>Blocked mein wo sessions bhi aate hain jo policy ne accept kiye aur security profile, jaise application control, ne roke. Traffic log mein action accept rehta hai aur UTM action mein block verdict. Mention karo ki aap utmaction field par Log View filter se confirm karoge.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Koi bhi number padhne se pehle ADOM, device aur "Based on N logs" line padho.</li>
<li>Sessions activity naapte hain; bytes weight; simulator ke bytes har traffic log par 84 hain.</li>
<li>Blocked ka matlab deny ya profile block verdict, isliye wo deny count se bada ho sakta hai.</li>
<li>Top lists rankings hain, totals nahi.</li>
<li>Chaunkane wale number ko Log View search se confirm karo.</li>
</ul></div>
`}};export{e as default};