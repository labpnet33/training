var e={id:`verification`,h:{en:`Verification: show class-map, show policy-map interface and counters`,hi:`Verification: show class-map, show policy-map interface aur counters`},body:{en:`
<p>A marking policy that you have not verified is a guess. QoS fails silently: nothing is down, no interface flaps, the ping works, and yet the phone sounds like a bad radio at 4 pm. The only way to know the policy works is to read the counters. This chapter teaches the three show commands you will use in every lab, how to read each line of their output, and the short checklist that turns the output into a decision. The commands are the same ones used in the classify, trust boundary, CoS and mismatch labs.</p>

<h3>Tool 1: show class-map, what the router thinks a class means</h3>
<p>This command shows only the definition. It never shows traffic. Use it to check the match type and the match lines before you blame anything else.</p>
<pre class="out">R1#show class-map
 Class Map match-any VOICE (id 1)
   Match access-group name VOICE-RTP

 Class Map match-any SIGNALING (id 2)
   Match protocol sip

 Class Map match-any WEB (id 3)
   Match protocol http
   Match protocol secure-http

 Class Map <span class="hl">match-all</span> BACKUP (id 4)
   Match access-group name BACKUP-SMB</pre>
<p>Three things to read: the word <b>match-any</b> or <b>match-all</b> (the default is match-all), the exact list of match lines, and the name of any ACL it points to. A class that points to an ACL is only as good as that ACL, so the next command is <code>show ip access-lists VOICE-RTP</code>. It prints, for example, <code>10 permit udp any any range 16384 32767</code>. Check the port range and the direction of the addresses.</p>

<h3>Tool 2: show policy-map interface, the proof</h3>
<p>This is the command that decides. Its form is <code>show policy-map interface INTERFACE input</code> or <code>output</code>. The direction word matters: a policy attached to input never shows under output, and the reverse.</p>
<pre class="out">R1#show policy-map interface GigabitEthernet0/1 input
 GigabitEthernet0/1

  Service-policy input: MARK-IN

    Class-map: VOICE (match-any)
      630 packets, 126000 bytes
      Match: access-group name VOICE-RTP
        630 packets, 126000 bytes
      QoS Set
        dscp ef
          <span class="hl">Packets marked 630</span>

    Class-map: SIGNALING (match-any)
      130 packets, 28600 bytes
      Match: protocol sip
      QoS Set
        dscp cs3
          Packets marked 130

    Class-map: class-default (match-any)
      <span class="hl">1880 packets</span>, 4512000 bytes
      Match: any</pre>
<p>Read it from the top. The first line after the interface name tells you the <b>direction and the policy name</b>. If it says <code>Service-policy output</code> when you expected input, you found the fault. Each class then shows its own packet counter. <code>Packets marked</code> under QoS Set counts the packets whose DSCP or CoS this class rewrote. A class that shows 0 packets matched but traffic is flowing means the match is wrong. A class that matched packets but shows 0 marked means there is no set action, or the policy is attached in a direction where marking is not applied. The last class is <b>class-default</b>: everything the earlier classes did not catch lands here, so a large number there is a symptom worth chasing.</p>
<table class="cmp"><tr><th>What you see</th><th>What it usually means</th></tr>
<tr><td>All counters zero, traffic running</td><td>Wrong interface, wrong direction, or no service-policy attached</td></tr>
<tr><td>Voice in class-default</td><td>ACL or match line does not cover the traffic</td></tr>
<tr><td>Class matched, marked 0</td><td>Class has no set action (trusted), or set is missing</td></tr>
<tr><td>Everything in the first class</td><td>Match is too broad, or match-any where match-all was meant</td></tr>
<tr><td>Marked count lower than matched count</td><td>Packets already carried the value, or a later device is rewriting</td></tr>
</table>

<h3>Tool 3: counters at the receiving end</h3>
<p>The policy counters tell you what the router did. They do not prove what the next device saw. Check the second hop with <code>show policy-map interface ... input</code> on the next router with a class that matches the expected DSCP, or on a host with <code>traffic show</code> for loss. In the labs, the call is verified by two facts: the EF class on the WAN output policy shows packets, and the flow shows 0.0 percent loss. Marking is only the first half of QoS; the proof is that the treatment arrived.</p>
<pre class="out">PHONE# traffic show
ID  Destination   Proto      DSCP  kbps  Time  Sent  Delivered  Loss
1   10.20.0.100   udp/20000  0     400   15/15 3750  3750       0.0%</pre>

<h3>A four-step reading routine</h3>
<ol>
<li><b>Direction.</b> Does the Service-policy line say input or output as intended, on the right interface?</li>
<li><b>Class counters.</b> Which class is taking the packets? Is it the class you wanted?</li>
<li><b>Marked counter.</b> Did the set action fire, and does the number match the matched count?</li>
<li><b>Outcome.</b> Did the far side see the marking, and did the flow keep its loss and delay targets?</li>
</ol>
<p>Always generate fresh traffic before reading counters, and read them again afterwards. Counters are cumulative, so a before and after comparison is more reliable than one big number.</p>

<div class="note"><p><b>Junos note.</b> The same three jobs exist on Junos with different names. A <b>behaviour aggregate (BA) classifier</b> trusts the marking already in the packet and maps code points to forwarding classes; a <b>multifield (MF) classifier</b> is a firewall filter that matches ports and addresses and sets the class; a <b>rewrite rule</b> writes the marking on the way out.</p>
<pre class="code">set class-of-service classifiers dscp CL-X forwarding-class expedited-forwarding loss-priority low code-points ef
set class-of-service interfaces ge-0/0/1 unit 0 classifiers dscp CL-X
set firewall family inet filter VOICE-IN term rtp from protocol udp
set firewall family inet filter VOICE-IN term rtp from destination-port 16384-32767
set firewall family inet filter VOICE-IN term rtp then forwarding-class expedited-forwarding
set firewall family inet filter VOICE-IN term rtp then accept
set interfaces ge-0/0/1 unit 0 family inet filter input VOICE-IN
set class-of-service rewrite-rules dscp RW-WAN forwarding-class expedited-forwarding loss-priority low code-point ef
set class-of-service interfaces ge-0/0/0 unit 0 rewrite-rules dscp RW-WAN</pre>
<p>Verify with <code>show class-of-service interface ge-0/0/1</code> (which classifier is bound), <code>show class-of-service classifier name CL-X</code>, <code>show firewall filter VOICE-IN</code> (term counters) and <code>show class-of-service rewrite-rule</code>.</p></div>

<div class="warn"><p><b>Common mistake.</b> Reading <code>show class-map</code> and concluding the policy works. That command shows definitions only. Only <code>show policy-map interface</code> with live traffic shows what happened to packets.</p></div>
<div class="exam"><p><b>Exam trap.</b> A policy-map attached with the wrong direction word shows no hits and no error. Also remember that class-default counts everything unmatched, and that "Packets marked" is separate from the matched packet count.</p></div>

<div class="scn"><h4>Green config, empty counters</h4><p>At a Nagpur clinic the engineer pasted the marking policy, saw no error, and closed the ticket. Next morning the helpdesk still got complaints. A look at <code>show policy-map interface</code> showed every counter at zero with calls running. The Service-policy line said output; the policy was meant to mark traffic arriving from the LAN, so it needed to be input. Moving one line fixed it.</p><p><b>Lesson:</b> a configuration that is accepted is not a configuration that is working.</p></div>
<div class="iv"><p class="q">"How do you verify a marking policy?"</p><p>Send test traffic, then run show policy-map interface for the right interface and direction. Check which class matched, whether the marked counter moved, and what landed in class-default. Confirm on the far side that the DSCP arrived and that the flow had no loss. Use show class-map and the ACL listing to explain surprises.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>show class-map shows definitions; show policy-map interface shows packets.</li>
<li>Read direction first, then per-class counters, then Packets marked, then class-default.</li>
<li>Zero counters with traffic running means wrong interface, direction or attachment.</li>
<li>Prove the outcome at the far end, not only on the marking device.</li>
<li>Junos equivalents: BA classifier, multifield filter, rewrite rule, checked with show class-of-service and show firewall filter.</li>
</ul></div>
`,hi:`
<p>Jis marking policy ko aapne verify nahi kiya, woh andaza hai. QoS chup-chaap fail hoti hai: kuch down nahi hota, koi interface flap nahi hota, ping chalta hai, phir bhi shaam 4 baje phone kharaab radio jaisa sunai deta hai. Policy chal rahi hai yeh jaanne ka ek hi tareeka hai counters padhna. Yeh chapter woh teen show commands sikhata hai jo har lab mein use hongi, unke output ki har line kaise padhni hai, aur woh chhoti checklist jo output ko decision mein badalti hai. Commands wahi hain jo classify, trust boundary, CoS aur mismatch labs mein hain.</p>

<h3>Tool 1: show class-map, router class ka matlab kya samajhta hai</h3>
<p>Yeh command sirf definition dikhati hai. Traffic kabhi nahi dikhati. Kisi aur ko blame karne se pehle match type aur match lines isse check karo.</p>
<pre class="out">R1#show class-map
 Class Map match-any VOICE (id 1)
   Match access-group name VOICE-RTP

 Class Map match-any SIGNALING (id 2)
   Match protocol sip

 Class Map match-any WEB (id 3)
   Match protocol http
   Match protocol secure-http

 Class Map <span class="hl">match-all</span> BACKUP (id 4)
   Match access-group name BACKUP-SMB</pre>
<p>Teen cheezein padho: <b>match-any</b> ya <b>match-all</b> shabd (default match-all hai), match lines ki exact list, aur jis ACL ko woh point karti hai uska naam. ACL ko point karne wali class utni hi achhi hai jitna woh ACL, isliye agla command <code>show ip access-lists VOICE-RTP</code> hai. Woh jaise <code>10 permit udp any any range 16384 32767</code> chhapta hai. Port range aur address ki direction check karo.</p>

<h3>Tool 2: show policy-map interface, saboot</h3>
<p>Yeh woh command hai jo faisla karti hai. Iska form <code>show policy-map interface INTERFACE input</code> ya <code>output</code> hai. Direction ka shabd matter karta hai: input par lagi policy output ke neeche kabhi nahi dikhti, aur ulta bhi.</p>
<pre class="out">R1#show policy-map interface GigabitEthernet0/1 input
 GigabitEthernet0/1

  Service-policy input: MARK-IN

    Class-map: VOICE (match-any)
      630 packets, 126000 bytes
      Match: access-group name VOICE-RTP
        630 packets, 126000 bytes
      QoS Set
        dscp ef
          <span class="hl">Packets marked 630</span>

    Class-map: SIGNALING (match-any)
      130 packets, 28600 bytes
      Match: protocol sip
      QoS Set
        dscp cs3
          Packets marked 130

    Class-map: class-default (match-any)
      <span class="hl">1880 packets</span>, 4512000 bytes
      Match: any</pre>
<p>Upar se padho. Interface naam ke baad ki pehli line <b>direction aur policy ka naam</b> batati hai. Agar aapne input socha tha aur woh <code>Service-policy output</code> kehti hai, to fault mil gaya. Phir har class ka apna packet counter hai. QoS Set ke neeche <code>Packets marked</code> un packets ko ginta hai jinka DSCP ya CoS is class ne rewrite kiya. Jis class mein 0 packets matched hain jabki traffic chal raha hai, uska match galat hai. Jis class ne packets match kiye par marked 0 hai, uske paas set action nahi hai, ya policy aisi direction mein lagi hai jahan marking apply nahi hoti. Aakhri class <b>class-default</b> hai: jo pehli classes ne nahi pakda woh sab yahin girta hai, isliye wahan bada number ek symptom hai jiske peeche jaana chahiye.</p>
<table class="cmp"><tr><th>Aap kya dekhte ho</th><th>Aam taur par matlab</th></tr>
<tr><td>Saare counters zero, traffic chal raha hai</td><td>Galat interface, galat direction, ya service-policy attached nahi</td></tr>
<tr><td>Voice class-default mein</td><td>ACL ya match line traffic ko cover nahi karti</td></tr>
<tr><td>Class matched, marked 0</td><td>Class mein set action nahi (trusted), ya set missing</td></tr>
<tr><td>Sab kuch pehli class mein</td><td>Match bahut broad, ya match-all ki jagah match-any</td></tr>
<tr><td>Marked count matched count se kam</td><td>Packets mein value pehle se thi, ya aage ka device rewrite kar raha hai</td></tr>
</table>

<h3>Tool 3: receiving end par counters</h3>
<p>Policy counters batate hain router ne kya kiya. Woh yeh sabit nahi karte ki agle device ne kya dekha. Doosra hop check karo: agle router par <code>show policy-map interface ... input</code> aisi class ke saath jo expected DSCP match kare, ya host par loss ke liye <code>traffic show</code>. Labs mein call do baaton se verify hoti hai: WAN output policy ki EF class mein packets dikhte hain, aur flow 0.0 percent loss dikhata hai. Marking QoS ka sirf pehla aadha hissa hai; saboot yeh hai ki treatment pahunchi.</p>
<pre class="out">PHONE# traffic show
ID  Destination   Proto      DSCP  kbps  Time  Sent  Delivered  Loss
1   10.20.0.100   udp/20000  0     400   15/15 3750  3750       0.0%</pre>

<h3>Padhne ka chaar-step routine</h3>
<ol>
<li><b>Direction.</b> Service-policy line sahi interface par jaisa socha waisa input ya output kehti hai?</li>
<li><b>Class counters.</b> Kaun si class packets le rahi hai? Kya wahi jo chahiye thi?</li>
<li><b>Marked counter.</b> Set action chala, aur number matched count se milta hai?</li>
<li><b>Outcome.</b> Door waale side ne marking dekhi, aur flow ne apne loss aur delay targets rakhe?</li>
</ol>
<p>Counters padhne se pehle hamesha fresh traffic generate karo, aur baad mein phir padho. Counters cumulative hote hain, isliye ek bade number se behtar before aur after ka comparison hai.</p>

<div class="note"><p><b>Junos note.</b> Junos par yahi teen kaam alag naamon se hote hain. <b>Behaviour aggregate (BA) classifier</b> packet mein pehle se maujood marking par trust karke code points ko forwarding classes se map karta hai; <b>multifield (MF) classifier</b> ek firewall filter hai jo ports aur addresses match karke class set karta hai; <b>rewrite rule</b> jaate waqt marking likhta hai.</p>
<pre class="code">set class-of-service classifiers dscp CL-X forwarding-class expedited-forwarding loss-priority low code-points ef
set class-of-service interfaces ge-0/0/1 unit 0 classifiers dscp CL-X
set firewall family inet filter VOICE-IN term rtp from protocol udp
set firewall family inet filter VOICE-IN term rtp from destination-port 16384-32767
set firewall family inet filter VOICE-IN term rtp then forwarding-class expedited-forwarding
set firewall family inet filter VOICE-IN term rtp then accept
set interfaces ge-0/0/1 unit 0 family inet filter input VOICE-IN
set class-of-service rewrite-rules dscp RW-WAN forwarding-class expedited-forwarding loss-priority low code-point ef
set class-of-service interfaces ge-0/0/0 unit 0 rewrite-rules dscp RW-WAN</pre>
<p>Verify karo <code>show class-of-service interface ge-0/0/1</code> (kaun sa classifier bound hai), <code>show class-of-service classifier name CL-X</code>, <code>show firewall filter VOICE-IN</code> (term counters) aur <code>show class-of-service rewrite-rule</code> se.</p></div>

<div class="warn"><p><b>Common mistake.</b> <code>show class-map</code> padhkar maan lena ki policy chal rahi hai. Woh command sirf definitions dikhati hai. Packets ke saath kya hua yeh sirf live traffic ke saath <code>show policy-map interface</code> dikhati hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Galat direction shabd ke saath lagi policy-map na hit dikhati hai na error. Yeh bhi yaad rakho ki class-default sab unmatched ko ginti hai, aur "Packets marked" matched packet count se alag hai.</p></div>

<div class="scn"><h4>Green config, khaali counters</h4><p>Nagpur ke ek clinic mein engineer ne marking policy paste ki, koi error nahi dikha, aur ticket band kar diya. Agli subah helpdesk ko phir bhi complaints mili. <code>show policy-map interface</code> dekha to calls chalte hue bhi har counter zero tha. Service-policy line output kehti thi; policy LAN se aane wale traffic ko mark karne ke liye thi, isliye input chahiye tha. Ek line badalne se theek ho gaya.</p><p><b>Lesson:</b> jo configuration accept ho gaya woh chal rahi configuration nahi hoti.</p></div>
<div class="iv"><p class="q">"Marking policy ko verify kaise karte ho?"</p><p>Test traffic bhejo, phir sahi interface aur direction ke liye show policy-map interface chalao. Dekho kaun si class matched hui, marked counter badha ya nahi, aur class-default mein kya gaya. Door ke side par confirm karo ki DSCP pahuncha aur flow mein loss nahi tha. Hairaan karne wali baaton ko samjhane ke liye show class-map aur ACL listing use karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>show class-map definitions dikhata hai; show policy-map interface packets dikhata hai.</li>
<li>Pehle direction padho, phir per-class counters, phir Packets marked, phir class-default.</li>
<li>Traffic chalte hue zero counters ka matlab galat interface, direction ya attachment hai.</li>
<li>Outcome door ke end par sabit karo, sirf marking karne wale device par nahi.</li>
<li>Junos equivalents: BA classifier, multifield filter, rewrite rule, jinhe show class-of-service aur show firewall filter se check karte hain.</li>
</ul></div>
`}};export{e as default};