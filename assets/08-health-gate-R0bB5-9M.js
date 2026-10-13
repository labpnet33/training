var e=`<pre class="code"><span class="c"># bgpxml.py - what get_bgp_summary_information() really returns</span>
from lxml import etree

from nkjunos import connect

dev = connect("J1")
rsp = dev.rpc.get_bgp_summary_information(normalize=True)
print(rsp.tag, [c.tag for c in rsp][:6])
peer = rsp.find(".//bgp-peer")
for child in peer:
    if child.tag in ("peer-address", "peer-as", "elapsed-time", "peer-state"):
        print("  %-14s %r %s" % (child.tag, child.text, dict(child.attrib) or ""))
raw = dev.rpc.get_bgp_summary_information()
print("without normalize=True:", repr(raw.find(".//bgp-peer").findtext("peer-address")))
dev.close()</pre>`,t=`<pre class="out">AUTO01$ python3 bgpxml.py
bgp-information ['group-count', 'peer-count', 'down-peer-count', 'bgp-rib', 'bgp-peer', 'bgp-peer']
  peer-address   '10.255.0.2'
  peer-as        '65000'
  elapsed-time   '00:01:11' {'seconds': '71'}
  peer-state     <span class="hl">'Established'</span> {'format': 'Establ'}
without normalize=True: '10.255.0.2'</pre>`,n=`<pre class="code"><span class="c"># appended to nkjunos.py</span>
def healthy(dev):
    """Return (ok, reason). ok is True only when there is at least one BGP peer and every peer is Established."""
    rsp = dev.rpc.get_bgp_summary_information(normalize=True)
    peers = rsp.findall(".//bgp-peer")
    if not peers:
        return False, "no BGP peers found"
    down = ["%s %s" % (p.findtext("peer-address"), p.findtext("peer-state")) for p in peers if p.findtext("peer-state") != "Established"]
    if down:
        return False, "not Established: " + ", ".join(down)
    return True, "%d BGP peers Established" % len(peers)</pre>`,r=`<pre class="code"><span class="c"># health.py - run healthy() on every Junos device</span>
from nkjunos import HOSTS, connect, healthy

for name in HOSTS:
    dev = connect(name)
    ok, why = healthy(dev)
    print("%s %s: %s" % (name, "healthy" if ok else "UNHEALTHY", why))
    dev.close()</pre>`,i=`<pre class="out">AUTO01$ python3 health.py
J1 healthy: 2 BGP peers Established
J2 healthy: 2 BGP peers Established
J3 healthy: 2 BGP peers Established</pre>`,a=`<pre class="out"><span class="c"># the trap, in one line</span>
>>> peers = []
>>> all(p == "Established" for p in peers)
<span class="hl">True</span></pre>`,o={id:`health-gate`,h:{en:`The health gate: prove it works`,hi:`Health gate: saabit karo ki kaam karta hai`},body:{en:`
<p>A commit that the router accepted is not a change that works. Commit confirmed gives you a time window; this chapter is about what you do inside it. The window is only useful if something looks at the network and makes a <b>decision</b>: confirm, or let the router roll back. That something is a <b>health gate</b>, a small function that returns "good" or "bad" with a reason.</p>

<h3>What to test</h3>
<p>Pick a check that fails when the change is wrong and passes when it is right. Reachability of the management address proves very little. A change to a loopback address keeps the router reachable and still breaks every BGP session built on it. For the module's flagship change, the thing at risk is the routing protocol, so the gate asks the router about BGP.</p>
<p>The RPC is <code>get-bgp-summary-information</code>, and PyEZ turns that name into a method: <code>dev.rpc.get_bgp_summary_information()</code> (hyphens become underscores; you saw the pattern in <code>adv-pyez</code>). Add <code>normalize=True</code> so that the text inside each element is stripped of whitespace padding. Real Junos pads many values; the lab does not show it, but the habit costs nothing and avoids a comparison that fails on <code>'Established\\n'</code>.</p>
`+e+`
`+t+`
<p>The reply is XML. The root is <code>bgp-information</code>; each neighbour is a <code>bgp-peer</code> element with children such as <code>peer-address</code>, <code>peer-as</code>, <code>elapsed-time</code> and <code>peer-state</code>. Two details matter for the code. The state text is the full word <code>Established</code>; the short form <code>Establ</code> appears only in a <code>format</code> attribute and in the CLI table. And the other states you will see when something is wrong are words like <code>Active</code>, <code>Connect</code> and <code>Idle</code>.</p>

<h3>The gate</h3>
<p>Here is the function Lab 1 asks you to add to <code>nkjunos.py</code>. It returns a pair, <code>(ok, reason)</code>, because a gate that only says "no" teaches the operator nothing. The reason goes in the log and in the ticket.</p>
`+n+`
<p>Walk through the decisions. It finds all peers anywhere in the reply with <code>findall(".//bgp-peer")</code>. It treats <b>no peers as a failure</b>, with its own message. It collects every peer that is not <code>Established</code> and reports them all, with their addresses and states, so that the message tells you which neighbours to look at. Only when peers exist and all are up does it say yes.</p>

<div class="warn"><p><b>The empty-list trap.</b> The natural one-liner is <code>all(p.findtext("peer-state") == "Established" for p in peers)</code>. When the list is empty (the BGP process is down, the filter is wrong, the reply was truncated) <code>all()</code> of nothing is <code>True</code>. The gate would declare a router with <b>zero</b> sessions healthy and confirm the change. The explicit "no peers" branch exists for exactly this reason. Any gate that checks "all of" a set must first check that the set is not empty.</p></div>
`+a+`
<h3>Run it on its own first</h3>
<p>Before you wire a gate into a push, run it alone on healthy devices and check that it says yes. A gate that has never been seen passing is a gate that may be broken, and a broken one that always fails rolls back every change, which is annoying, while one that always passes is dangerous.</p>
`+r+`
`+i+`
<h3>Give the network time to react</h3>
<p>A protocol does not break at the instant of commit. BGP sessions notice a missing source address when a timer fires or a TCP session resets. If the gate runs one millisecond after <code>commit()</code>, it sees the old, still-Established state and approves a bad change. The Lab 1 tool waits <code>SETTLE_SECONDS = 20</code> before it looks. That number must be long enough for the damage to show, and it must be shorter than the confirm timer with room to spare. With <code>CONFIRM_MINUTES = 2</code> (120 seconds), a 20 second settle leaves a large margin for the check itself and for the rollback commit.</p>
<table class="cmp"><tr><th>Setting</th><th>Too small</th><th>Too large</th></tr>
<tr><td>Settle delay</td><td>Gate sees the old state, approves a bad change</td><td>Long window with a broken network</td></tr>
<tr><td>Confirm timer</td><td>Router rolls back before the gate finishes</td><td>Slow recovery if the script dies</td></tr></table>

<div class="note"><p><b>Lab and real gear.</b> The lab models a broken loopback address as peers going <code>Active</code> (the push in chapter 9 shows it). It does not model every protocol fault; for example a wrong peer AS or a changed MD5 key does not make the lab's sessions fail. On real routers those would. The method does not change: choose the check that matches the risk of the change.</p></div>

<div class="exam"><p><b>Exam trap.</b> "If the NETCONF session still works after the commit, the change is safe." A router can be perfectly manageable and have no routing. Test the service the change could harm, and test that the thing you test exists.</p></div>

<div class="scn"><h4>Zero peers, all green</h4><p>A gate used <code>all()</code> over a BGP peer list. During a change the BGP process restarted and the reply was empty for a few seconds. <code>all([])</code> was True, the script confirmed, and the router came back with a missing policy and no sessions. Nobody noticed until traffic moved.</p><p><b>Lesson:</b> "none are bad" and "some are good" are different statements. Check for at least one peer first.</p></div>

<div class="iv"><p class="q">"What is a health gate and how would you build one for BGP in PyEZ?"</p><p>A function that decides, after the change and a settle delay, whether to confirm or roll back. For BGP I call the get_bgp_summary_information RPC with normalize=True, find all bgp-peer elements, fail if there are none, fail and name every peer whose peer-state is not Established, and pass only if all are up. It returns a flag and a reason so the log says why.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A health gate decides confirm or rollback; test the service the change could break.</li>
<li><code>dev.rpc.get_bgp_summary_information(normalize=True)</code> returns XML with <code>bgp-peer</code> elements and a <code>peer-state</code>.</li>
<li><code>all()</code> over an empty list is <code>True</code>: always check for at least one peer.</li>
<li>Return a reason, not only a boolean.</li>
<li>Wait for the network to react, and keep the settle time well inside the confirm timer.</li></ul></div>
`,hi:`
<p>Router ne jo commit accept kar liya woh aisa change nahi jo kaam karta ho. Commit confirmed aapko time window deta hai; yeh chapter is baat ka hai ki aap uske andar kya karte ho. Window tabhi kaam ki hai jab koi cheez network ko dekhe aur ek <b>faisla</b> le: confirm karo, ya router ko rollback karne do. Wahi cheez <b>health gate</b> hai, ek chhota function jo reason ke saath "good" ya "bad" lautata hai.</p>

<h3>Kya test karna hai</h3>
<p>Aisa check chuno jo change galat hone par fail ho aur sahi hone par pass. Management address ki reachability bahut kam saabit karti hai. Loopback address ka change router ko reachable rakhta hai aur phir bhi us par bane har BGP session ko tod deta hai. Module ke flagship change mein risk routing protocol ko hai, isliye gate router se BGP ke baare mein poochhta hai.</p>
<p>RPC <code>get-bgp-summary-information</code> hai, aur PyEZ us naam ko method bana deta hai: <code>dev.rpc.get_bgp_summary_information()</code> (hyphen underscore ban jaate hain; yeh pattern aapne <code>adv-pyez</code> mein dekha). <code>normalize=True</code> jodo taaki har element ka text whitespace padding se saaf ho. Real Junos kai values pad karta hai; lab nahi dikhata, par yeh aadat mehengi nahi hai aur <code>'Established\\n'</code> par fail hone wali comparison se bachati hai.</p>
`+e+`
`+t+`
<p>Reply XML hai. Root <code>bgp-information</code> hai; har neighbour ek <code>bgp-peer</code> element hai jiske children <code>peer-address</code>, <code>peer-as</code>, <code>elapsed-time</code> aur <code>peer-state</code> jaise hain. Code ke liye do details matter karti hain. State ka text poora shabd <code>Established</code> hai; chhota roop <code>Establ</code> sirf <code>format</code> attribute aur CLI table mein aata hai. Aur kuch galat hone par jo doosre states dikhenge woh <code>Active</code>, <code>Connect</code> aur <code>Idle</code> jaise shabd hain.</p>

<h3>Gate</h3>
<p>Yeh woh function hai jo Lab 1 aapse <code>nkjunos.py</code> mein jodne ko kehta hai. Yeh ek jodi lautata hai, <code>(ok, reason)</code>, kyunki jo gate sirf "nahi" kehta woh operator ko kuch nahi sikhata. Reason log aur ticket mein jaata hai.</p>
`+n+`
<p>Faislon ko step by step dekho. Yeh <code>findall(".//bgp-peer")</code> se reply mein kahin bhi saare peers dhoondhta hai. Yeh <b>no peers ko failure</b> maanta hai, apne alag message ke saath. Yeh har woh peer ikattha karta hai jo <code>Established</code> nahi hai aur sabko unke addresses aur states ke saath report karta hai, taaki message batae ki kin neighbours ko dekhna hai. Sirf tab yes kehta hai jab peers maujood hain aur sab up hain.</p>

<div class="warn"><p><b>Empty-list trap.</b> Swabhavik one-liner hai <code>all(p.findtext("peer-state") == "Established" for p in peers)</code>. Jab list empty ho (BGP process down hai, filter galat hai, reply truncate ho gayi) tab kuch nahi ka <code>all()</code> <code>True</code> hota hai. Gate <b>zero</b> sessions wale router ko healthy bata kar change confirm kar deta. Explicit "no peers" branch isi wajah se hai. Jo bhi gate kisi set ke "sab" ko check kare use pehle check karna chahiye ki set empty nahi hai.</p></div>
`+a+`
<h3>Pehle akele chalao</h3>
<p>Gate ko push mein jodne se pehle use healthy devices par akele chalao aur dekho ki woh yes kehta hai. Jis gate ko kabhi pass hote nahi dekha woh toota ho sakta hai, aur jo toota gate hamesha fail karta hai woh har change ko rollback karta hai, jo pareshan karta hai, jabki jo hamesha pass karta hai woh khatarnak hai.</p>
`+r+`
`+i+`
<h3>Network ko react karne ka samay do</h3>
<p>Protocol commit ke ek pal mein nahi tootta. BGP sessions ko missing source address tab pata chalta hai jab timer fire hota hai ya TCP session reset hota hai. Agar gate <code>commit()</code> ke ek millisecond baad chalta hai, to woh purana, abhi bhi Established state dekhta hai aur bure change ko approve kar deta hai. Lab 1 tool dekhne se pehle <code>SETTLE_SECONDS = 20</code> ruk jaata hai. Yeh number itna lamba hona chahiye ki nuksaan dikhe, aur confirm timer se gunjaish ke saath chhota hona chahiye. <code>CONFIRM_MINUTES = 2</code> (120 second) ke saath, 20 second ka settle check ke liye aur rollback commit ke liye badi gunjaish chhodta hai.</p>
<table class="cmp"><tr><th>Setting</th><th>Bahut chhota</th><th>Bahut bada</th></tr>
<tr><td>Settle delay</td><td>Gate purana state dekhta hai, bure change ko approve karta hai</td><td>Toote network ke saath lambi window</td></tr>
<tr><td>Confirm timer</td><td>Gate khatam hone se pehle router rollback kar deta hai</td><td>Script mar jaye to dheema recovery</td></tr></table>

<div class="note"><p><b>Lab aur real gear.</b> Lab toote loopback address ko aise model karta hai ki peers <code>Active</code> ho jaate hain (chapter 9 ka push dikhata hai). Yeh har protocol fault model nahi karta; jaise galat peer AS ya badla MD5 key lab ke sessions ko fail nahi karta. Real routers par woh karte. Tareeka nahi badalta: change ke risk se milta check chuno.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Commit ke baad NETCONF session kaam kar raha hai to change safe hai." Router bilkul manageable ho sakta hai aur uske paas routing na ho. Us service ko test karo jise change nuksaan pahuncha sakta hai, aur yeh bhi test karo ki jise aap test kar rahe ho woh maujood hai.</p></div>

<div class="scn"><h4>Zero peers, sab hara</h4><p>Ek gate ne BGP peer list par <code>all()</code> use kiya. Change ke dauran BGP process restart hua aur reply kuch second ke liye empty thi. <code>all([])</code> True tha, script ne confirm kar diya, aur router missing policy aur bina sessions ke wapas aaya. Traffic move hone tak kisi ko pata nahi chala.</p><p><b>Lesson:</b> "koi bura nahi" aur "kuch achhe hain" alag statements hain. Pehle check karo ki kam se kam ek peer hai.</p></div>

<div class="iv"><p class="q">"Health gate kya hai aur PyEZ mein BGP ke liye ek kaise banaoge?"</p><p>Ek function jo change aur settle delay ke baad tay karta hai ki confirm karna hai ya rollback. BGP ke liye main get_bgp_summary_information RPC ko normalize=True ke saath call karta hoon, saare bgp-peer elements dhoondhta hoon, agar koi nahi to fail, aur har us peer ka naam lekar fail jiska peer-state Established nahi hai, aur sirf tab pass jab sab up hon. Yeh flag aur reason lautata hai taaki log batae kyun.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Health gate confirm ya rollback tay karta hai; us service ko test karo jise change tod sakta hai.</li>
<li><code>dev.rpc.get_bgp_summary_information(normalize=True)</code> XML lautata hai jisme <code>bgp-peer</code> elements aur <code>peer-state</code> hota hai.</li>
<li>Empty list par <code>all()</code> <code>True</code> hota hai: hamesha kam se kam ek peer check karo.</li>
<li>Sirf boolean nahi, reason bhi lautao.</li>
<li>Network ke react karne ka intezaar karo, aur settle time ko confirm timer ke andar gunjaish ke saath rakho.</li></ul></div>
`}};export{o as default};