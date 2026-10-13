var e={id:`named-editing`,h:{en:`Named ACLs, sequence numbers and live editing`,hi:`Named ACLs, sequence numbers aur live editing`},body:{en:`
<p>Think of a numbered rule book printed on paper versus the same book in a word processor with line numbers. With paper, adding a rule in the middle means reprinting the whole book. With line numbers, you type "insert at line 15" and you are done. Old-style numbered ACLs typed with <code>access-list N</code> behave like the paper book: every new line goes to the end. <b>Named ACLs</b> with <b>sequence numbers</b> are the word processor. In production, where a list is live on an interface carrying real users, that difference matters a lot.</p>

<h3>Why engineers prefer named ACLs</h3>
<ul>
<li><b>Readable names</b>: <code>BRANCH-IN</code> or <code>VTY-MGMT</code> tell the next engineer what the list is for; <code>117</code> does not.</li>
<li><b>Sub-mode editing</b>: you enter the list once and type entries, remarks and deletions inside it.</li>
<li><b>Sequence numbers</b>: every entry has one, so you can insert between entries, delete one entry, and renumber the list.</li>
<li><b>No number-range limits</b>: the name says standard or extended by the command you used, not by a number range.</li>
</ul>
<pre class="code">HQ(config)# ip access-list extended BRANCH-IN
HQ(config-ext-nacl)# remark Branch to DC policy
HQ(config-ext-nacl)# permit tcp 10.50.0.0 0.0.255.255 host 10.60.1.25 eq smtp
HQ(config-ext-nacl)# deny ip 10.50.8.0 0.0.0.255 any
HQ(config-ext-nacl)# permit ip 10.50.0.0 0.0.255.255 any</pre>
<p>Entries without a number get sequence numbers automatically, starting at <b>10</b> and increasing by <b>10</b>. The prompts are <code>(config-std-nacl)#</code> for standard and <code>(config-ext-nacl)#</code> for extended named lists.</p>

<h3>The three editing moves</h3>
<table class="cmp">
<tr><th>Goal</th><th>Command (inside the ACL sub-mode unless noted)</th></tr>
<tr><td>Insert an entry between 10 and 20</td><td><code>15 permit tcp ...</code></td></tr>
<tr><td>Delete exactly one entry</td><td><code>no 10</code></td></tr>
<tr><td>Renumber to 10, 20, 30...</td><td>Global config: <code>ip access-list resequence BRANCH-IN 10 10</code></td></tr>
</table>
<p>The resequence command takes a starting number and an increment. After many insertions you might have 10, 12, 15, 17, 20; resequencing restores clean gaps so you can insert again later.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Editing a named ACL">
<text x="110" y="24" text-anchor="middle" class="svg-accent" font-size="13">Before</text><text x="320" y="24" text-anchor="middle" class="svg-accent" font-size="13">Insert 15, no 10</text><text x="530" y="24" text-anchor="middle" class="svg-accent" font-size="13">Resequence 10 10</text>
<rect x="20" y="40" width="180" height="36" rx="6" fill="#fed7aa"/><text x="110" y="63" text-anchor="middle" class="svg-ink" font-size="12">10 permit smtp</text>
<rect x="20" y="84" width="180" height="36" rx="6" fill="#e2e8f0"/><text x="110" y="107" text-anchor="middle" class="svg-ink" font-size="12">20 deny contractors</text>
<rect x="20" y="128" width="180" height="36" rx="6" fill="#e2e8f0"/><text x="110" y="151" text-anchor="middle" class="svg-ink" font-size="12">30 permit branch</text>
<rect x="230" y="40" width="180" height="36" rx="6" fill="#bbf7d0"/><text x="320" y="63" text-anchor="middle" class="svg-ink" font-size="12">15 permit con web</text>
<rect x="230" y="84" width="180" height="36" rx="6" fill="#e2e8f0"/><text x="320" y="107" text-anchor="middle" class="svg-ink" font-size="12">20 deny contractors</text>
<rect x="230" y="128" width="180" height="36" rx="6" fill="#e2e8f0"/><text x="320" y="151" text-anchor="middle" class="svg-ink" font-size="12">30 permit branch</text>
<rect x="440" y="40" width="180" height="36" rx="6" fill="#bbf7d0"/><text x="530" y="63" text-anchor="middle" class="svg-ink" font-size="12">10 permit con web</text>
<rect x="440" y="84" width="180" height="36" rx="6" fill="#e2e8f0"/><text x="530" y="107" text-anchor="middle" class="svg-ink" font-size="12">20 deny contractors</text>
<rect x="440" y="128" width="180" height="36" rx="6" fill="#e2e8f0"/><text x="530" y="151" text-anchor="middle" class="svg-ink" font-size="12">30 permit branch</text>
<text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="12">The list stays applied on Gi0/1 the whole time; users never lose it.</text>
</svg><p class="cap">Lab acl-named in three steps: insert before the deny, remove the obsolete rule, restore clean numbering.</p></div>

<h3>Lab walkthrough: acl-named</h3>
<p>HQ filters branch traffic with BRANCH-IN inbound on Gi0/1. New policy: contractors (10.50.8.0/24) may open the intranet web server 10.60.1.80 on port 80, nothing else; the mail rule is obsolete. You must edit the list in place, without removing it from the interface.</p>
<pre class="code">HQ# show access-lists BRANCH-IN
HQ# configure terminal
HQ(config)# ip access-list extended BRANCH-IN
<span class="c">! 15 is checked before the contractor deny at 20</span>
HQ(config-ext-nacl)# 15 permit tcp 10.50.8.0 0.0.0.255 host 10.60.1.80 eq www
<span class="c">! remove the obsolete mail rule only</span>
HQ(config-ext-nacl)# no 10
HQ(config-ext-nacl)# exit
HQ(config)# ip access-list resequence BRANCH-IN 10 10
HQ(config)# end</pre>
<pre class="out">HQ# show access-lists BRANCH-IN
Extended IP access list BRANCH-IN
    <span class="hl">10 permit tcp 10.50.8.0 0.0.0.255 host 10.60.1.80 eq www</span> (3 matches)
    20 deny ip 10.50.8.0 0.0.0.255 any (6 matches)
    30 permit ip 10.50.0.0 0.0.255.255 any (41 matches)</pre>
<p>Verify behaviour: PC-CON can browse 10.60.1.80 (line 10) but cannot ping it or send mail to 10.60.1.25 on 25 (line 20); PC-STAFF still pings the web server (line 30).</p>

<div class="eg"><p><b>Worked example: why sequence 15 and not a plain permit?</b> If you typed the permit without a number, it would get sequence 40, after <code>30 permit ip 10.50.0.0 0.0.255.255 any</code> and, more importantly, after <code>20 deny ip 10.50.8.0 0.0.0.255 any</code>. Contractor web traffic would match line 20 first and be denied. Line 40 would never see a packet. Any number from 11 to 19 would work; 15 leaves room on both sides.</p></div>

<h3>Editing numbered ACLs, and the classic trap</h3>
<p>Numbered lists also have sequence numbers internally. You can edit them the modern way by entering them as if they were named: <code>ip access-list extended 110</code> then <code>25 permit ...</code> or <code>no 20</code>. The trap is the old global command: <code>no access-list 110 deny icmp ...</code> does <b>not</b> remove one line. It deletes the <b>entire</b> ACL 110. If the list was applied inbound, the interface now references an empty list and permits everything, so your protection silently disappears.</p>
<p>Two more display details: <code>show running-config</code> lists named entries without sequence numbers (use <code>show access-lists</code> to see them), and in standard ACLs IOS may display host entries before range entries for faster lookups; the sequence numbers still show the real order of evaluation.</p>

<div class="warn"><p><b>Common mistake.</b> Removing the ACL from the interface "to be safe" while editing. For the minutes it is off, everything is permitted. With sequence numbers you edit a live list safely; changes take effect as soon as you press Enter, entry by entry.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which command removes only the third entry of ACL 101?" The answer uses the sub-mode (<code>ip access-list extended 101</code>, then <code>no 30</code>), never <code>no access-list 101 ...</code>, which deletes the whole list.</p></div>

<div class="scn"><h4>The midnight change that opened the door</h4><p>An engineer at a logistics company needed to remove one outdated line from numbered ACL 150 on the internet edge router. He typed <code>no access-list 150 permit tcp any host 198.51.100.20 eq 21</code>. The router accepted it without a warning. The next morning a scan report showed the internal FTP server exposed. <code>show access-lists 150</code> returned nothing: the whole list was gone, and the interface still had <code>ip access-group 150 in</code> referencing an empty list, which filters nothing. The fix was to restore the list from the backup config and learn the sub-mode method.</p><p><b>Lesson:</b> never use <code>no access-list N ...</code> to delete a single entry. Enter the list and remove the sequence number.</p></div>

<div class="iv"><p class="q">"How do you add a rule in the middle of an ACL that is live in production?"</p><p>Strong answer: enter the list with <code>ip access-list extended NAME</code> (this also works for numbered lists), give the new entry a sequence number between the neighbours, verify with <code>show access-lists</code>, and resequence later if gaps run out. Mention that <code>no access-list N</code> deletes the whole list and that you never remove the ACL from the interface while editing.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Named ACLs use <code>ip access-list standard|extended NAME</code> and a sub-mode.</li>
<li>Default sequence numbers start at 10 and step by 10; insert with a number in between.</li>
<li><code>no 10</code> in the sub-mode deletes one entry; <code>ip access-list resequence NAME 10 10</code> renumbers.</li>
<li><code>no access-list N ...</code> deletes the entire numbered list.</li>
<li>Numbered lists can be edited with sequence numbers through the <code>ip access-list</code> sub-mode.</li>
</ul></div>
`,hi:`
<p>Kagaz par chhapi numbered rule book aur wahi book line numbers wale word processor mein, dono ko socho. Kagaz wali mein beech mein rule jodne ka matlab hai poori book dobara chhapna. Line numbers ke saath aap "line 15 par insert karo" type karte ho aur kaam khatam. <code>access-list N</code> se type kiye gaye purane style ke numbered ACLs kagaz wali book jaise behave karte hain: har nayi line end mein jaati hai. <b>Sequence numbers</b> wale <b>named ACLs</b> word processor hain. Production mein, jahan list real users wale interface par live hai, yeh fark bahut matter karta hai.</p>

<h3>Engineers named ACLs kyun pasand karte hain</h3>
<ul>
<li><b>Padhne layak naam</b>: <code>BRANCH-IN</code> ya <code>VTY-MGMT</code> agle engineer ko batate hain ki list kis liye hai; <code>117</code> nahi batata.</li>
<li><b>Sub-mode editing</b>: aap list mein ek baar ghuste ho aur uske andar entries, remarks aur deletions type karte ho.</li>
<li><b>Sequence numbers</b>: har entry ka ek number hota hai, isliye aap entries ke beech insert kar sakte ho, ek entry delete kar sakte ho, aur list ko renumber kar sakte ho.</li>
<li><b>Number-range ki koi limit nahi</b>: standard hai ya extended, yeh aapki use ki gayi command batati hai, number range nahi.</li>
</ul>
<pre class="code">HQ(config)# ip access-list extended BRANCH-IN
HQ(config-ext-nacl)# remark Branch to DC policy
HQ(config-ext-nacl)# permit tcp 10.50.0.0 0.0.255.255 host 10.60.1.25 eq smtp
HQ(config-ext-nacl)# deny ip 10.50.8.0 0.0.0.255 any
HQ(config-ext-nacl)# permit ip 10.50.0.0 0.0.255.255 any</pre>
<p>Bina number wali entries ko automatically sequence numbers milte hain, <b>10</b> se shuru hokar <b>10</b> ke step mein. Prompts hain standard ke liye <code>(config-std-nacl)#</code> aur extended named lists ke liye <code>(config-ext-nacl)#</code>.</p>

<h3>Teen editing moves</h3>
<table class="cmp">
<tr><th>Goal</th><th>Command (ACL sub-mode ke andar, jab tak alag na likha ho)</th></tr>
<tr><td>10 aur 20 ke beech entry insert karo</td><td><code>15 permit tcp ...</code></td></tr>
<tr><td>Bilkul ek entry delete karo</td><td><code>no 10</code></td></tr>
<tr><td>10, 20, 30... mein renumber karo</td><td>Global config: <code>ip access-list resequence BRANCH-IN 10 10</code></td></tr>
</table>
<p>Resequence command ek starting number aur ek increment leti hai. Kai insertions ke baad aapke paas 10, 12, 15, 17, 20 ho sakte hain; resequence saaf gaps wapas laata hai taaki baad mein phir insert kar sako.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Named ACL edit karna">
<text x="110" y="24" text-anchor="middle" class="svg-accent" font-size="13">Pehle</text><text x="320" y="24" text-anchor="middle" class="svg-accent" font-size="13">Insert 15, no 10</text><text x="530" y="24" text-anchor="middle" class="svg-accent" font-size="13">Resequence 10 10</text>
<rect x="20" y="40" width="180" height="36" rx="6" fill="#fed7aa"/><text x="110" y="63" text-anchor="middle" class="svg-ink" font-size="12">10 permit smtp</text>
<rect x="20" y="84" width="180" height="36" rx="6" fill="#e2e8f0"/><text x="110" y="107" text-anchor="middle" class="svg-ink" font-size="12">20 deny contractors</text>
<rect x="20" y="128" width="180" height="36" rx="6" fill="#e2e8f0"/><text x="110" y="151" text-anchor="middle" class="svg-ink" font-size="12">30 permit branch</text>
<rect x="230" y="40" width="180" height="36" rx="6" fill="#bbf7d0"/><text x="320" y="63" text-anchor="middle" class="svg-ink" font-size="12">15 permit con web</text>
<rect x="230" y="84" width="180" height="36" rx="6" fill="#e2e8f0"/><text x="320" y="107" text-anchor="middle" class="svg-ink" font-size="12">20 deny contractors</text>
<rect x="230" y="128" width="180" height="36" rx="6" fill="#e2e8f0"/><text x="320" y="151" text-anchor="middle" class="svg-ink" font-size="12">30 permit branch</text>
<rect x="440" y="40" width="180" height="36" rx="6" fill="#bbf7d0"/><text x="530" y="63" text-anchor="middle" class="svg-ink" font-size="12">10 permit con web</text>
<rect x="440" y="84" width="180" height="36" rx="6" fill="#e2e8f0"/><text x="530" y="107" text-anchor="middle" class="svg-ink" font-size="12">20 deny contractors</text>
<rect x="440" y="128" width="180" height="36" rx="6" fill="#e2e8f0"/><text x="530" y="151" text-anchor="middle" class="svg-ink" font-size="12">30 permit branch</text>
<text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="12">List poore samay Gi0/1 par applied rehti hai; users ki protection kabhi nahi jaati.</text>
</svg><p class="cap">Lab acl-named teen steps mein: deny se pehle insert, purana rule hatao, saaf numbering wapas lao.</p></div>

<h3>Lab walkthrough: acl-named</h3>
<p>HQ branch traffic ko Gi0/1 par inbound BRANCH-IN se filter karta hai. Nayi policy: contractors (10.50.8.0/24) intranet web server 10.60.1.80 port 80 par khol sakte hain, aur kuch nahi; mail rule purana ho gaya. Aapko list ko interface se hataye bina wahin edit karna hai.</p>
<pre class="code">HQ# show access-lists BRANCH-IN
HQ# configure terminal
HQ(config)# ip access-list extended BRANCH-IN
<span class="c">! 15 contractor deny (20) se pehle check hota hai</span>
HQ(config-ext-nacl)# 15 permit tcp 10.50.8.0 0.0.0.255 host 10.60.1.80 eq www
<span class="c">! sirf purana mail rule hatao</span>
HQ(config-ext-nacl)# no 10
HQ(config-ext-nacl)# exit
HQ(config)# ip access-list resequence BRANCH-IN 10 10
HQ(config)# end</pre>
<pre class="out">HQ# show access-lists BRANCH-IN
Extended IP access list BRANCH-IN
    <span class="hl">10 permit tcp 10.50.8.0 0.0.0.255 host 10.60.1.80 eq www</span> (3 matches)
    20 deny ip 10.50.8.0 0.0.0.255 any (6 matches)
    30 permit ip 10.50.0.0 0.0.255.255 any (41 matches)</pre>
<p>Behaviour verify karo: PC-CON 10.60.1.80 browse kar sakta hai (line 10) par use ping nahi kar sakta ya 10.60.1.25 par port 25 par mail nahi bhej sakta (line 20); PC-STAFF ab bhi web server ko ping karta hai (line 30).</p>

<div class="eg"><p><b>Worked example: sequence 15 kyun, plain permit kyun nahi?</b> Agar aap permit bina number ke type karte, to use sequence 40 milta, <code>30 permit ip 10.50.0.0 0.0.255.255 any</code> ke baad aur, sabse zaroori, <code>20 deny ip 10.50.8.0 0.0.0.255 any</code> ke baad. Contractor ka web traffic pehle line 20 se match hota aur deny ho jaata. Line 40 ko kabhi packet dikhta hi nahi. 11 se 19 tak koi bhi number chalta; 15 dono taraf jagah chhodta hai.</p></div>

<h3>Numbered ACLs edit karna, aur classic trap</h3>
<p>Numbered lists ke andar bhi sequence numbers hote hain. Aap unhe modern tareeke se edit kar sakte ho, unmein aise ghus kar jaise woh named hon: <code>ip access-list extended 110</code> phir <code>25 permit ...</code> ya <code>no 20</code>. Trap purani global command hai: <code>no access-list 110 deny icmp ...</code> ek line <b>nahi</b> hatati. Yeh <b>poora</b> ACL 110 delete kar deti hai. Agar list inbound applied thi, to interface ab ek khaali list ko reference karta hai aur sab permit karta hai, yaani aapki protection chupchaap gayab.</p>
<p>Do aur display details: <code>show running-config</code> named entries ko bina sequence numbers ke dikhata hai (unhe dekhne ke liye <code>show access-lists</code> use karo), aur standard ACLs mein IOS tez lookup ke liye host entries ko range entries se pehle dikha sakta hai; sequence numbers phir bhi evaluation ka asli order dikhate hain.</p>

<div class="warn"><p><b>Common galti.</b> Edit karte waqt "safe rehne ke liye" ACL ko interface se hata dena. Jitne minute woh hata rehta hai, sab permit hota hai. Sequence numbers ke saath aap live list ko safely edit karte ho; changes Enter dabate hi, entry by entry, lagoo ho jaate hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Kaunsi command ACL 101 ki sirf teesri entry hatati hai?" Answer sub-mode use karta hai (<code>ip access-list extended 101</code>, phir <code>no 30</code>), kabhi <code>no access-list 101 ...</code> nahi, jo poori list delete kar deti hai.</p></div>

<div class="scn"><h4>Aadhi raat ka change jisne darwaza khol diya</h4><p>Ek logistics company ke engineer ko internet edge router par numbered ACL 150 se ek purani line hatani thi. Usne <code>no access-list 150 permit tcp any host 198.51.100.20 eq 21</code> type kiya. Router ne bina warning ke accept kar liya. Agli subah scan report ne internal FTP server ko exposed dikhaya. <code>show access-lists 150</code> ne kuch nahi lautaya: poori list gayab thi, aur interface par ab bhi <code>ip access-group 150 in</code> ek khaali list ko reference kar raha tha, jo kuch filter nahi karti. Fix tha backup config se list restore karna aur sub-mode wala tareeka seekhna.</p><p><b>Seekh:</b> ek entry delete karne ke liye kabhi <code>no access-list N ...</code> use mat karo. List mein ghuso aur sequence number hatao.</p></div>

<div class="iv"><p class="q">"Production mein live ACL ke beech mein rule kaise jodoge?"</p><p>Strong answer: <code>ip access-list extended NAME</code> se list mein ghuso (yeh numbered lists ke liye bhi chalta hai), nayi entry ko padosiyon ke beech ka sequence number do, <code>show access-lists</code> se verify karo, aur gaps khatam hon to baad mein resequence karo. Batao ki <code>no access-list N</code> poori list delete karta hai aur edit karte waqt aap kabhi ACL ko interface se nahi hataate.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Named ACLs <code>ip access-list standard|extended NAME</code> aur ek sub-mode use karte hain.</li>
<li>Default sequence numbers 10 se shuru hokar 10 ke step mein badhte hain; beech ka number dekar insert karo.</li>
<li>Sub-mode mein <code>no 10</code> ek entry delete karta hai; <code>ip access-list resequence NAME 10 10</code> renumber karta hai.</li>
<li><code>no access-list N ...</code> poori numbered list delete kar deta hai.</li>
<li>Numbered lists ko bhi <code>ip access-list</code> sub-mode ke through sequence numbers se edit kar sakte ho.</li>
</ul></div>
`}};export{e as default};