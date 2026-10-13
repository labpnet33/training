var e={id:`order-shadowing`,h:{en:`Rule order, shadowing and the admin exception that never matched`,hi:`Rule order, shadowing aur woh admin exception jo kabhi match nahi hui`},body:{en:`
<p>PAN-OS reads the rulebase <b>from the top down and stops at the first match</b>. That single sentence explains most policy tickets. If a broad rule sits above a specific rule, the specific rule can never be reached. We call the hidden rule <b>shadowed</b>. Imagine a post office with two counters: the first says "all parcels go to the general queue", the second says "fragile parcels go to the special desk". A fragile parcel never reaches the second counter, because the first counter already took it.</p>
<div class="dia"><svg viewBox="0 0 640 114" role="img" aria-label="Rule order and shadowing"><rect x="20" y="20" width="130" height="74" rx="10" fill="#fed7aa"/><text x="85" y="50" text-anchor="middle" class="svg-ink" font-size="13">Rule 1</text><text x="85" y="72" text-anchor="middle" class="svg-muted" font-size="11">Block-SSH</text><line x1="153" y1="57" x2="173" y2="57" stroke="#64748b" stroke-width="2"/><polygon points="173,57 167,53 167,61" fill="#64748b"/><rect x="176" y="20" width="130" height="74" rx="10" fill="#bbf7d0"/><text x="241" y="50" text-anchor="middle" class="svg-ink" font-size="13">Rule 2</text><text x="241" y="72" text-anchor="middle" class="svg-muted" font-size="11">Allow-Out</text><line x1="309" y1="57" x2="329" y2="57" stroke="#64748b" stroke-width="2"/><polygon points="329,57 323,53 323,61" fill="#64748b"/><rect x="332" y="20" width="130" height="74" rx="10" fill="#e2e8f0"/><text x="397" y="50" text-anchor="middle" class="svg-ink" font-size="13">Rule 3</text><text x="397" y="72" text-anchor="middle" class="svg-muted" font-size="11">Admin-SSH</text><line x1="465" y1="57" x2="485" y2="57" stroke="#64748b" stroke-width="2"/><polygon points="485,57 479,53 479,61" fill="#64748b"/><rect x="488" y="20" width="130" height="74" rx="10" fill="#e2e8f0"/><text x="553" y="50" text-anchor="middle" class="svg-ink" font-size="13">Default</text><text x="553" y="72" text-anchor="middle" class="svg-muted" font-size="11">interzone</text></svg><p class="cap">SSH from the admin PC meets Block-SSH first. Admin-SSH at position 3 is never evaluated for it.</p></div>
<h3>The ticket</h3>
<p>Security blocked SSH to the internet for everyone (<code>Block-SSH</code>). The network team needs one exception: the admin PC 10.0.1.50 must reach the jump server 8.8.8.8 over SSH. <code>Admin-SSH</code> was added, but the admin still cannot connect. First look at the running rulebase in order:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show running security-policy
<span class="hl">"Block-SSH; index: 1" {</span>
        from trust;
        source any;
        source-region none;
        to untrust;
        destination any;
        destination-region none;
        user any;
        category any;
        application/service ssh/any;
        action deny;
        icmp-unreachable: no
        terminal yes;
}

<span class="hl">"Allow-Out; index: 2" {</span>
        from trust;
        source any;
        source-region none;
        to untrust;
        destination any;
        destination-region none;
        user any;
        category any;
        application/service [ ping dns web-browsing ssl ]/application-default;
        action allow;
        icmp-unreachable: no
        terminal yes;
}

<span class="hl">"Admin-SSH; index: 3" {</span>
        from trust;
        source ADMIN-PC;
        source-region none;
        to untrust;
        destination JUMP-SRV;
        destination-region none;
        user any;
        category any;
        application/service ssh/application-default;
        action allow;
        icmp-unreachable: no
        terminal yes;
}</pre>
<p>The index numbers say it all: <code>Block-SSH</code> is index 1 and <code>Admin-SSH</code> index 3. Now prove which rule the admin traffic really hits, without sending anything:</p>
<pre class="out">admin@NK-PUNE-PA&gt; test security-policy-match from trust to untrust source 10.0.1.50 destination 8.8.8.8 protocol 6 destination-port 22
<span class="hl">"Block-SSH; index: 1" {</span>
        from trust;
        source any;
        source-region none;
        to untrust;
        destination any;
        destination-region none;
        category any;
        application/service ssh/any;
<span class="hl">        action deny;</span>
        icmp-unreachable: no
        terminal yes;
}</pre>
<p><code>Block-SSH</code> matched because its source is <code>any</code> and its service is <code>any</code>, so it covers the admin PC too. Fix: move the specific exception <b>above</b> the broad rule. In configure mode you can see the order, move the rule and commit:</p>
<pre class="out">admin@NK-PUNE-PA&gt; configure
Entering configuration mode
[edit]
admin@NK-PUNE-PA# show rulebase security rules
rules {
<span class="hl">  Block-SSH {</span>
    from trust;
    to untrust;
    source any;
    destination any;
    application ssh;
    service any;
    action deny;
  }
<span class="hl">  Allow-Out {</span>
    from trust;
    to untrust;
    source any;
    destination any;
    application [ ping dns web-browsing ssl ];
    service application-default;
    action allow;
  }
<span class="hl">  Admin-SSH {</span>
    from trust;
    to untrust;
    source ADMIN-PC;
    destination JUMP-SRV;
    application ssh;
    service application-default;
    action allow;
  }
}

[edit]</pre>
<pre class="out">admin@NK-PUNE-PA# move rulebase security rules Admin-SSH before Block-SSH
[edit]
admin@NK-PUNE-PA# commit
Commit job 3 is in progress. Use Ctrl+C to return to command prompt
......55%......75%.....98%.......100%
<span class="hl">Configuration committed successfully</span>

[edit]
admin@NK-PUNE-PA# exit
Exiting configuration mode</pre>
<pre class="out">admin@NK-PUNE-PA&gt; test security-policy-match from trust to untrust source 10.0.1.50 destination 8.8.8.8 protocol 6 destination-port 22
<span class="hl">"Admin-SSH; index: 1" {</span>
        source ADMIN-PC;
        source-region none;
        destination JUMP-SRV;
        destination-region none;
        action allow;</pre>
<p>The decision changed. Check from the clients:</p>
<pre class="out">ADMIN&gt; ssh -l admin 8.8.8.8
Connected to 8.8.8.8.
Connection closed by foreign host.</pre>
<pre class="out">PC1&gt; ssh -l admin 8.8.8.8
<span class="hl">ssh: connect to host 8.8.8.8 port 22: Connection timed out</span></pre>
<p>The admin connects; PC1 still times out, which is exactly what we want: the exception is narrow (one source, one destination) and the general block remains for everybody else. The traffic log keeps the evidence of both decisions:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show log traffic
Time                App             From            Src Port  Source
Rule            Action          To              Dst Port  Destination
                SrcUser         DstUser         End Reason
====================================================================================================
2026/10/02 03:58:04 ssh             trust           57160     10.0.1.10
<span class="hl">Block-SSH       deny            untrust         22        8.8.8.8</span>
<span class="hl">                                                policy-deny</span>

2026/10/02 03:58:04 ssh             trust           64251     10.0.1.50
<span class="hl">Admin-SSH       allow           untrust         22        8.8.8.8</span>
                                                aged-out</pre>
<h3>Rules for good order</h3>
<ul><li><b>Specific above general.</b> Exceptions and narrow allows first, broad allows next, broad denies last.</li><li><b>Use <code>move</code></b>: <code>move rulebase security rules X before Y</code>, <code>after Y</code>, <code>top</code> or <code>bottom</code>.</li><li><b>Rule types.</b> A rule can be <code>universal</code> (default; intrazone and interzone), <code>intrazone</code> or <code>interzone</code>. Use the narrow type to avoid unintended matches.</li><li><b>Look for shadows.</b> Newer PAN-OS releases warn about shadowed rules at commit time and the web interface has tools to find them; do not depend on them, and read the order yourself.</li></ul>
<div class="warn"><p><b>Common mistake.</b> Adding the new rule at the bottom "because that is where new rules go". New rules are appended at the end. Always ask: is there an earlier rule that already catches this traffic?</p></div>
<div class="exam"><p><b>Exam trap.</b> The rule evaluated is the <b>first</b> one that matches, not the most specific one. PAN-OS has no "best match". Also note that a rule that matches decides even if a later rule would allow.</p></div>
<div class="scn"><h4>Two engineers, one rulebase</h4><p>One engineer added a broad deny for file sharing at the top of the rulebase on Monday. On Wednesday a colleague added an allow for the finance team to a partner file portal near the bottom. Finance could not reach the portal for two days. A single <code>test security-policy-match</code> showed the Monday rule matching first. The team now keeps the rulebase in sections (exceptions, allows by business unit, blocks, cleanup) and reviews the order in every change request.</p><p><b>Lesson:</b> the position of a rule is part of its meaning.</p></div>
<div class="iv"><p class="q">"A new allow rule is added but traffic is still blocked. How do you find out why?"</p><p>I run <code>test security-policy-match</code> with the real zones, addresses, protocol and port. The output names the rule that wins. If it is an earlier broad rule I move the new rule above it with <code>move</code> and commit, then rerun the test and check the traffic log. I also confirm that the new rule uses the correct zones, the pre-NAT destination address and the right application.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>First match wins; there is no best match.</li><li>A broad rule above a specific one shadows it.</li><li><code>move rulebase security rules X before Y</code> reorders; commit applies it.</li><li>Prove with <code>test security-policy-match</code> before and after.</li></ul></div>
`,hi:`
<p>PAN-OS rulebase ko <b>upar se neeche padhta hai aur pehli match par ruk jaata hai</b>. Yeh ek vakya zyadatar policy tickets samjha deta hai. Agar broad rule specific rule ke upar baithi ho to specific rule kabhi pahunchi hi nahi jaa sakti. Chhupi hui rule ko <b>shadowed</b> kehte hain. Ek post office socho jisme do counter hain: pehla kehta hai "saare parcels general queue mein", doosra kehta hai "fragile parcels special desk par". Fragile parcel doosre counter tak nahi pahunchta, kyunki pehle counter ne use le liya.</p>
<div class="dia"><svg viewBox="0 0 640 114" role="img" aria-label="Rule order aur shadowing"><rect x="20" y="20" width="130" height="74" rx="10" fill="#fed7aa"/><text x="85" y="50" text-anchor="middle" class="svg-ink" font-size="13">Rule 1</text><text x="85" y="72" text-anchor="middle" class="svg-muted" font-size="11">Block-SSH</text><line x1="153" y1="57" x2="173" y2="57" stroke="#64748b" stroke-width="2"/><polygon points="173,57 167,53 167,61" fill="#64748b"/><rect x="176" y="20" width="130" height="74" rx="10" fill="#bbf7d0"/><text x="241" y="50" text-anchor="middle" class="svg-ink" font-size="13">Rule 2</text><text x="241" y="72" text-anchor="middle" class="svg-muted" font-size="11">Allow-Out</text><line x1="309" y1="57" x2="329" y2="57" stroke="#64748b" stroke-width="2"/><polygon points="329,57 323,53 323,61" fill="#64748b"/><rect x="332" y="20" width="130" height="74" rx="10" fill="#e2e8f0"/><text x="397" y="50" text-anchor="middle" class="svg-ink" font-size="13">Rule 3</text><text x="397" y="72" text-anchor="middle" class="svg-muted" font-size="11">Admin-SSH</text><line x1="465" y1="57" x2="485" y2="57" stroke="#64748b" stroke-width="2"/><polygon points="485,57 479,53 479,61" fill="#64748b"/><rect x="488" y="20" width="130" height="74" rx="10" fill="#e2e8f0"/><text x="553" y="50" text-anchor="middle" class="svg-ink" font-size="13">Default</text><text x="553" y="72" text-anchor="middle" class="svg-muted" font-size="11">interzone</text></svg><p class="cap">Admin PC ka SSH pehle Block-SSH se milta hai. Position 3 ki Admin-SSH uske liye kabhi evaluate nahi hoti.</p></div>
<h3>Ticket</h3>
<p>Security ne sabke liye internet par SSH block kiya (<code>Block-SSH</code>). Network team ko ek exception chahiye: admin PC 10.0.1.50 jump server 8.8.8.8 tak SSH se pahunche. <code>Admin-SSH</code> add hui, lekin admin ab bhi connect nahi kar pa raha. Pehle running rulebase order mein dekho:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show running security-policy
<span class="hl">"Block-SSH; index: 1" {</span>
        from trust;
        source any;
        source-region none;
        to untrust;
        destination any;
        destination-region none;
        user any;
        category any;
        application/service ssh/any;
        action deny;
        icmp-unreachable: no
        terminal yes;
}

<span class="hl">"Allow-Out; index: 2" {</span>
        from trust;
        source any;
        source-region none;
        to untrust;
        destination any;
        destination-region none;
        user any;
        category any;
        application/service [ ping dns web-browsing ssl ]/application-default;
        action allow;
        icmp-unreachable: no
        terminal yes;
}

<span class="hl">"Admin-SSH; index: 3" {</span>
        from trust;
        source ADMIN-PC;
        source-region none;
        to untrust;
        destination JUMP-SRV;
        destination-region none;
        user any;
        category any;
        application/service ssh/application-default;
        action allow;
        icmp-unreachable: no
        terminal yes;
}</pre>
<p>Index numbers sab bata dete hain: <code>Block-SSH</code> index 1 hai aur <code>Admin-SSH</code> index 3. Ab bina kuch bheje saabit karo ki admin ka traffic asal mein kaunsi rule se takrata hai:</p>
<pre class="out">admin@NK-PUNE-PA&gt; test security-policy-match from trust to untrust source 10.0.1.50 destination 8.8.8.8 protocol 6 destination-port 22
<span class="hl">"Block-SSH; index: 1" {</span>
        from trust;
        source any;
        source-region none;
        to untrust;
        destination any;
        destination-region none;
        category any;
        application/service ssh/any;
<span class="hl">        action deny;</span>
        icmp-unreachable: no
        terminal yes;
}</pre>
<p><code>Block-SSH</code> match hui kyunki uska source <code>any</code> hai aur service <code>any</code>, isliye woh admin PC ko bhi cover karti hai. Fix: specific exception ko broad rule ke <b>upar</b> move karo. Configure mode mein order dekh sakte ho, rule move karo aur commit karo:</p>
<pre class="out">admin@NK-PUNE-PA&gt; configure
Entering configuration mode
[edit]
admin@NK-PUNE-PA# show rulebase security rules
rules {
<span class="hl">  Block-SSH {</span>
    from trust;
    to untrust;
    source any;
    destination any;
    application ssh;
    service any;
    action deny;
  }
<span class="hl">  Allow-Out {</span>
    from trust;
    to untrust;
    source any;
    destination any;
    application [ ping dns web-browsing ssl ];
    service application-default;
    action allow;
  }
<span class="hl">  Admin-SSH {</span>
    from trust;
    to untrust;
    source ADMIN-PC;
    destination JUMP-SRV;
    application ssh;
    service application-default;
    action allow;
  }
}

[edit]</pre>
<pre class="out">admin@NK-PUNE-PA# move rulebase security rules Admin-SSH before Block-SSH
[edit]
admin@NK-PUNE-PA# commit
Commit job 3 is in progress. Use Ctrl+C to return to command prompt
......55%......75%.....98%.......100%
<span class="hl">Configuration committed successfully</span>

[edit]
admin@NK-PUNE-PA# exit
Exiting configuration mode</pre>
<pre class="out">admin@NK-PUNE-PA&gt; test security-policy-match from trust to untrust source 10.0.1.50 destination 8.8.8.8 protocol 6 destination-port 22
<span class="hl">"Admin-SSH; index: 1" {</span>
        source ADMIN-PC;
        source-region none;
        destination JUMP-SRV;
        destination-region none;
        action allow;</pre>
<p>Decision badal gaya. Clients se check karo:</p>
<pre class="out">ADMIN&gt; ssh -l admin 8.8.8.8
Connected to 8.8.8.8.
Connection closed by foreign host.</pre>
<pre class="out">PC1&gt; ssh -l admin 8.8.8.8
<span class="hl">ssh: connect to host 8.8.8.8 port 22: Connection timed out</span></pre>
<p>Admin connect ho jaata hai; PC1 abhi bhi timeout hota hai, jo bilkul hum chahte the: exception narrow hai (ek source, ek destination) aur general block baaki sabke liye bana hua hai. Traffic log dono decisions ka saboot rakhta hai:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show log traffic
Time                App             From            Src Port  Source
Rule            Action          To              Dst Port  Destination
                SrcUser         DstUser         End Reason
====================================================================================================
2026/10/02 03:58:04 ssh             trust           57160     10.0.1.10
<span class="hl">Block-SSH       deny            untrust         22        8.8.8.8</span>
<span class="hl">                                                policy-deny</span>

2026/10/02 03:58:04 ssh             trust           64251     10.0.1.50
<span class="hl">Admin-SSH       allow           untrust         22        8.8.8.8</span>
                                                aged-out</pre>
<h3>Achhe order ke niyam</h3>
<ul><li><b>Specific general ke upar.</b> Pehle exceptions aur narrow allows, phir broad allows, sabse neeche broad denies.</li><li><b><code>move</code> use karo</b>: <code>move rulebase security rules X before Y</code>, <code>after Y</code>, <code>top</code> ya <code>bottom</code>.</li><li><b>Rule types.</b> Rule <code>universal</code> (default; intrazone aur interzone), <code>intrazone</code> ya <code>interzone</code> ho sakti hai. Anchahe match se bachne ke liye narrow type use karo.</li><li><b>Shadows dhoondo.</b> Naye PAN-OS releases commit ke samay shadowed rules ka warning dete hain aur web interface mein unhe dhoondne ke tools hain; unpar nirbhar mat raho, order khud padho.</li></ul>
<div class="warn"><p><b>Common mistake.</b> Nayi rule "kyunki nayi rules wahan jaati hain" bottom par daal dena. Nayi rules end mein judti hain. Hamesha poocho: kya koi pehle ki rule is traffic ko pehle hi pakad leti hai?</p></div>
<div class="exam"><p><b>Exam trap.</b> Evaluate hone wali rule <b>pehli</b> matching rule hai, sabse specific nahi. PAN-OS mein "best match" nahi hota. Yeh bhi: jo rule match ho jaaye wahi decide karti hai, chahe baad ki rule allow karti ho.</p></div>
<div class="scn"><h4>Do engineers, ek rulebase</h4><p>Ek engineer ne Monday ko rulebase ke top par file sharing ka broad deny lagaya. Wednesday ko ek colleague ne finance team ke liye partner file portal ka allow bottom ke paas jodha. Finance do din portal tak nahi pahunch paayi. Ek <code>test security-policy-match</code> ne dikha diya ki Monday ki rule pehle match ho rahi thi. Ab team rulebase ko sections mein rakhti hai (exceptions, business unit ke allows, blocks, cleanup) aur har change request mein order review karti hai.</p><p><b>Lesson:</b> rule ki position uske matlab ka hissa hai.</p></div>
<div class="iv"><p class="q">"Nayi allow rule add hui lekin traffic abhi bhi block hai. Kaise pata karoge kyun?"</p><p>Main asli zones, addresses, protocol aur port ke saath <code>test security-policy-match</code> chalata hoon. Output jeetne wali rule ka naam batata hai. Agar woh pehle ki broad rule hai to nayi rule ko <code>move</code> se uske upar karta hoon aur commit, phir test dobara chalata hoon aur traffic log check karta hoon. Yeh bhi confirm karta hoon ki nayi rule mein sahi zones, pre-NAT destination address aur sahi application hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Pehli match jeetti hai; best match nahi hota.</li><li>Specific ke upar broad rule use shadow kar deti hai.</li><li><code>move rulebase security rules X before Y</code> order badalta hai; commit lagu karta hai.</li><li>Pehle aur baad mein <code>test security-policy-match</code> se saabit karo.</li></ul></div>
`}};export{e as default};