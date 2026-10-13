var e={id:`troubleshooting`,h:{en:`Troubleshooting: the change that vanished`,hi:`Troubleshooting: woh change jo gayab ho gaya`},body:{en:`
<p>This chapter walks through Lab 2, "The change that vanished". It is a story in four faults, and each one is a failure mode you have already met in this module. The skill we practise is not knowing the answer in advance; it is a method that finds the answer when you do not.</p>

<h3>An analogy: tracking a parcel</h3>
<p>When a parcel does not arrive you do not shout at the courier. You open the tracking page and look for the last scan: left the depot, reached the city, out for delivery, and then nothing. The fault is at the first step that did not happen. A NETCONF change also passes fixed stages, and the error tells you which one it stopped at.</p>

<h3>The method: follow the stages in order</h3>
<table class="cmp"><tr><th>Stage</th><th>Typical failure</th><th>What to look at</th></tr>
<tr><td>1. Transport</td><td><code>SSHError</code>, <code>AuthenticationError</code></td><td>Host, port 830, credentials, <code>netconf-yang</code> or <code>services netconf ssh</code></td></tr>
<tr><td>2. Capabilities</td><td><code>MissingCapabilityError</code></td><td>The hello list</td></tr>
<tr><td>3. The data</td><td><code>RPCError</code> with <code>invalid-value</code>, <code>data-missing</code></td><td>The value in <code>err.message</code></td></tr>
<tr><td>4. Locks</td><td><code>lock-denied</code></td><td>The holder in <code>err.info</code></td></tr>
<tr><td>5. Commit</td><td>Silent: change appears, then disappears</td><td>Commit log, confirming commit</td></tr>
<tr><td>6. Time</td><td>The result is wrong later, not now</td><td>Read again after the timer; use a separate verifier</td></tr></table>
<p>Work from the top. Never fix stage 4 before stage 1 works; each fix reveals the next error, and that is progress, not bad luck.</p>

<h3>The ticket</h3>
<p>CHG-2041 asked to give the BLR uplink of J1 and R1 the description <code>TO-BLR-CORE</code> and new /30 addresses. A colleague's script <code>chg2041.py</code> was meant to do it: back up J1, change R1 (IOS XE), change J1 (Junos). Here are the parts that matter. There are four faults hidden in it and in the helper files.</p>
<pre class="code"><span class="c"># chg2041.py (the parts that matter) - what the on-call engineer inherited</span>
def backup(name):
    """keep a copy of the running config before we touch the device"""
    m = connect(name)
    m.lock("candidate")                             <span class="c"># fault 3 lives here</span>
    text = m.get_config(source="running").data_xml
    with open("backup-%s.xml" % name, "w") as f:
        f.write(text)
    print("%s: backup saved by session %s (%d bytes)" % (name, m.session_id, len(text)))


def change_junos(name):
    with connect(name) as m:
        print("%s: change session is %s" % (name, m.session_id))
        with m.locked("candidate"):
            m.edit_config(target="candidate", config=JUNOS_CFG)
            m.validate(source="candidate")
            m.commit(confirmed=True, timeout="60")  <span class="c"># fault 4 lives here</span>
        have = read_interface(m, "junos", DEVICES[name]["uplink"])
        print("%s: committed, running now reads %s" % (name, have))


for name, step in [("J1", backup), ("R1", change_iosxe), ("J1", change_junos)]:
    try:
        step(name)
    except RPCError as err:
        show_error(name, err)
        sys.exit(1)
print("CHG-2041 done: 2 of 2 devices changed")</pre>

<h3>Fault 1: it will not even connect</h3>
<pre class="out">AUTO01$ python3 chg2041.py
Traceback (most recent call last):
  File "chg2041.py", line 70, in &lt;module&gt;
    step(name)
  File "chg2041.py", line 34, in backup
    m = connect(name)
  File "ncutil.py", line 15, in connect
    return manager.connect(host=d["host"], port=d["port"], username=USER, password=PASSWORD,
  <span class="c">... ncclient internal frames elided ...</span>
ncclient.transport.errors.<span class="hl">SSHError: Channel closed.</span></pre>
<p>The traceback is long, but the last line is the answer. (Frames inside ncclient are elided here; in the lab you see them as well, and you can skip them.) <code>SSHError: Channel closed.</code> is the signature from chapter 2: SSH answered, but there is no NETCONF subsystem on that port. The frame that shows <i>our</i> code is <code>ncutil.py</code> line 15, where <code>connect()</code> uses <code>d["port"]</code>. The inventory has J1 on port 22; it should be 830. We repair it with one command:</p>
<pre class="out">AUTO01$ sed -i 's/"port": 22,/"port": 830,/' ncutil.py

AUTO01$ python3 chg2041.py
J1: backup saved by session 1650 (1144 bytes)
R1: RPCError type=application tag=<span class="hl">invalid-value</span> severity=error
R1: <span class="hl">invalid value "172.16.10.500" for leaf ip (expected an IPv4 address)</span></pre>
<p>The next run goes further: J1's backup works, and R1 fails with a different message. We moved forward.</p>

<h3>Fault 2: the device refuses the data</h3>
<p>R1 reports <code>RPCError</code> with <code>tag=invalid-value</code> and the text <code>invalid value "172.16.10.500" for leaf ip (expected an IPv4 address)</code>. A part of an IPv4 address cannot be 500. This is a typo in <code>IOSXE_CFG</code> (it should be <code>.5</code>), so the data is the problem, not the device, the lock or the network. The tag tells us not to retry. Fix and run again:</p>
<pre class="out">AUTO01$ sed -i 's/172.16.10.500/172.16.10.5/' chg2041.py

AUTO01$ python3 chg2041.py
J1: backup saved by session <span class="hl">1667</span> (1144 bytes)
R1: running now reads ('TO-BLR-CORE', '172.16.10.5/30')
J1: change session is 1684
J1: RPCError type=protocol tag=<span class="hl">lock-denied</span> severity=error
J1: configuration database is locked by another session
J1: the lock is held by session <span class="hl">1667</span></pre>
<p>R1 now works and reads back correctly. The script gets to J1 and meets the next fault.</p>

<h3>Fault 3: a lock we took ourselves</h3>
<p>The error is <code>lock-denied</code>, type <code>protocol</code>, and the helper line prints the holder: <b>session 1667</b>. Compare that number with the first line of the same run: <code>backup saved by session 1667</code>. The holder is <b>our own</b> backup. The function <code>backup()</code> opens a session with <code>connect(name)</code> (no <code>with</code>), calls <code>m.lock("candidate")</code>, and never unlocks it or closes the session. When <code>change_junos</code> later opens session 1684 and tries to lock, it is refused by a session in the same process.</p>
<p>Reading data (a backup) does not need a lock at all. Deleting the <code>lock</code> line is the right fix; if you did want a lock you would use <code>with m.locked("candidate"):</code> so it is released.</p>
<pre class="out">AUTO01$ sed -i '/^    m\\.lock/d' chg2041.py

AUTO01$ python3 chg2041.py
J1: backup saved by session 1701 (1144 bytes)
R1: running now reads ('TO-BLR-CORE', '172.16.10.5/30')
J1: change session is 1718
J1: committed, running now reads ('TO-BLR-CORE', '172.16.20.5/30')
<span class="hl">CHG-2041 done: 2 of 2 devices changed</span></pre>

<h3>Fault 4: "done", but it is not</h3>
<p>The script says <code>CHG-2041 done: 2 of 2 devices changed</code> and every line before it looks right, including the read-back after the commit. Everything was green. The ticket would normally be closed here. But a separate verification script runs after a pause, because on Junos the clock matters:</p>
<pre class="out">AUTO01$ python3 wait.py 70
waiting 70 s ...
done
AUTO01$ python3 verify.py
J1 <span class="hl">WRONG</span> ('LINK-TO-PUN-OLD', '172.16.20.1/30')
R1 ok ('TO-BLR-CORE', '172.16.10.5/30')
J1&gt; show system commit
0   2026-10-11 08:09:12 UTC by root via other
    <span class="hl">automatic rollback (commit confirmed not confirmed)</span>
1   2026-10-11 08:08:12 UTC by netops via netconf commit confirmed, rollback in 1mins
2   2026-10-11 08:07:24 UTC by root via other</pre>
<p>J1 holds the <b>old</b> values again. The commit log explains it, and it is the same line as in chapter 7: entry 1 is our "commit confirmed, rollback in 1mins" and entry 0 is "automatic rollback (commit confirmed not confirmed)". Nobody sent the confirming commit. The change was live for a minute (which is why the read-back in the script looked correct) and then the device quietly reverted it, as designed.</p>
<p>The fix is a confirming <code>m.commit()</code> after the read-back is right, on the same session:</p>
<pre class="code"><span class="c"># change_junos after the fix: confirm only after the read-back is right</span>
def change_junos(name):
    with connect(name) as m:
        print("%s: change session is %s" % (name, m.session_id))
        with m.locked("candidate"):
            m.edit_config(target="candidate", config=JUNOS_CFG)
            m.validate(source="candidate")
            m.commit(confirmed=True, timeout="60")
        have = read_interface(m, "junos", DEVICES[name]["uplink"])
        print("%s: committed, running now reads %s" % (name, have))
        m.commit()                                  <span class="c"># the confirming commit</span></pre>
<pre class="out">AUTO01$ python3 chg2041.py
J1: backup saved by session 1752 (1144 bytes)
R1: running now reads ('TO-BLR-CORE', '172.16.10.5/30')
J1: change session is 1769
J1: committed, running now reads ('TO-BLR-CORE', '172.16.20.5/30')
CHG-2041 done: 2 of 2 devices changed
AUTO01$ python3 wait.py 70
waiting 70 s ...
done
AUTO01$ python3 verify.py
J1 <span class="hl">ok</span> ('TO-BLR-CORE', '172.16.20.5/30')
R1 ok ('TO-BLR-CORE', '172.16.10.5/30')</pre>
<p>Now the verifier, which runs 70 seconds later, finds both devices correct. (In a real script you would also add the new-session check from chapter 9 before confirming. The lab keeps the fix small so the cause stays visible.)</p>

<h3>The four faults in one table</h3>
<table class="cmp"><tr><th>#</th><th>Symptom</th><th>Stage</th><th>Cause</th><th>Fix</th></tr>
<tr><td>1</td><td><code>SSHError: Channel closed.</code></td><td>Transport</td><td>Port 22 in the inventory</td><td>Port 830</td></tr>
<tr><td>2</td><td><code>invalid-value</code></td><td>Data</td><td>Typo <code>172.16.10.500</code></td><td>Correct the value</td></tr>
<tr><td>3</td><td><code>lock-denied</code>, holder 1667</td><td>Locks</td><td>Own backup held the lock</td><td>Remove the lock (or use <code>with</code>)</td></tr>
<tr><td>4</td><td>Change gone after a minute</td><td>Commit, time</td><td>Confirmed commit never confirmed</td><td>Confirm after the read-back</td></tr></table>

<div class="warn"><p><b>Common mistake.</b> Closing the ticket on the script's own "done" message. A script cannot see what happens after it exits, and a confirmed commit works by timer. Verify with a <i>separate</i> run, later than the rollback time, and keep the commit log as evidence.</p></div>
<div class="exam"><p><b>Exam trap.</b> "The change was visible right after the commit" does not prove it is permanent. On Junos with <code>confirmed=True</code> it is visible until the timer ends.</p></div>

<div class="scn"><h4>Friday's green, Monday's red</h4><p>The change window ended at 22:00 with all scripts green. On Monday the monitoring showed the old description on 6 of 40 routers. All six were Junos; the script had committed confirmed with a 5-minute timer and exited without a confirm. The rollback happened at 22:05, after everyone had gone home. The post-change verifier was added to the pipeline, scheduled for 10 minutes after each run.</p><p><b>Lesson:</b> verify later than the longest timer you use.</p></div>

<div class="iv"><p class="q">"A NETCONF change script reports success, but the device does not have the change. What do you check?"</p><p>First whether it was a confirmed commit that was never confirmed: I look at the commit log for "automatic rollback". Then whether another session or a later commit overwrote it, and whether I wrote to the candidate but never committed. I make the script read back and I verify again after the rollback timer has passed.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Troubleshoot in stages: transport, capabilities, data, locks, commit, time.</li>
<li>The last line of a traceback and the <code>err.tag</code> tell you the stage; skip ncclient internal frames.</li>
<li>A lock holder in <code>err.info</code> may be your own earlier session.</li>
<li>An unconfirmed confirmed commit disappears; the commit log shows "automatic rollback".</li>
<li>Verify with a separate run after the timer, not only inside the script.</li>
</ul></div>
`,hi:`
<p>Yeh chapter Lab 2, "The change that vanished", ko step by step chalata hai. Yeh chaar faults ki kahani hai, aur har ek aisa failure mode hai jo aap is module mein pehle dekh chuke ho. Hum jo skill practice karte hain woh jawab pehle se jaanna nahi hai; woh ek method hai jo tab jawab dhoondh leta hai jab aapko pata nahi hota.</p>

<h3>Analogy: parcel track karna</h3>
<p>Parcel na pahunche to aap courier par chillate nahi. Tracking page kholte ho aur aakhri scan dekhte ho: depot se nikla, shehar pahuncha, delivery ke liye nikla, aur phir kuch nahi. Fault us pehle step par hai jo hua nahi. NETCONF change bhi tay stages se guzarta hai, aur error batata hai kis stage par ruka.</p>

<h3>Method: stages ko order mein follow karo</h3>
<table class="cmp"><tr><th>Stage</th><th>Aam failure</th><th>Kya dekhna hai</th></tr>
<tr><td>1. Transport</td><td><code>SSHError</code>, <code>AuthenticationError</code></td><td>Host, port 830, credentials, <code>netconf-yang</code> ya <code>services netconf ssh</code></td></tr>
<tr><td>2. Capabilities</td><td><code>MissingCapabilityError</code></td><td>Hello ki list</td></tr>
<tr><td>3. Data</td><td><code>invalid-value</code>, <code>data-missing</code> wala <code>RPCError</code></td><td><code>err.message</code> ki value</td></tr>
<tr><td>4. Locks</td><td><code>lock-denied</code></td><td><code>err.info</code> mein holder</td></tr>
<tr><td>5. Commit</td><td>Chupchaap: change dikhta hai, phir gayab</td><td>Commit log, confirming commit</td></tr>
<tr><td>6. Time</td><td>Result baad mein galat, abhi nahi</td><td>Timer ke baad dobara padho; alag verifier use karo</td></tr></table>
<p>Upar se kaam karo. Stage 1 chale bina stage 4 theek mat karo; har fix agla error dikhata hai, aur yeh progress hai, buri kismat nahi.</p>

<h3>Ticket</h3>
<p>CHG-2041 ne J1 aur R1 ke BLR uplink ko description <code>TO-BLR-CORE</code> aur naye /30 addresses dene ko kaha. Ek colleague ki script <code>chg2041.py</code> yeh karne ke liye thi: J1 ka backup, R1 (IOS XE) badlo, J1 (Junos) badlo. Yeh woh hisse hain jo matter karte hain. Isme aur helper files mein chaar faults chhupe hain.</p>
<pre class="code"><span class="c"># chg2041.py (the parts that matter) - what the on-call engineer inherited</span>
def backup(name):
    """keep a copy of the running config before we touch the device"""
    m = connect(name)
    m.lock("candidate")                             <span class="c"># fault 3 lives here</span>
    text = m.get_config(source="running").data_xml
    with open("backup-%s.xml" % name, "w") as f:
        f.write(text)
    print("%s: backup saved by session %s (%d bytes)" % (name, m.session_id, len(text)))


def change_junos(name):
    with connect(name) as m:
        print("%s: change session is %s" % (name, m.session_id))
        with m.locked("candidate"):
            m.edit_config(target="candidate", config=JUNOS_CFG)
            m.validate(source="candidate")
            m.commit(confirmed=True, timeout="60")  <span class="c"># fault 4 lives here</span>
        have = read_interface(m, "junos", DEVICES[name]["uplink"])
        print("%s: committed, running now reads %s" % (name, have))


for name, step in [("J1", backup), ("R1", change_iosxe), ("J1", change_junos)]:
    try:
        step(name)
    except RPCError as err:
        show_error(name, err)
        sys.exit(1)
print("CHG-2041 done: 2 of 2 devices changed")</pre>

<h3>Fault 1: connect hi nahi hota</h3>
<pre class="out">AUTO01$ python3 chg2041.py
Traceback (most recent call last):
  File "chg2041.py", line 70, in &lt;module&gt;
    step(name)
  File "chg2041.py", line 34, in backup
    m = connect(name)
  File "ncutil.py", line 15, in connect
    return manager.connect(host=d["host"], port=d["port"], username=USER, password=PASSWORD,
  <span class="c">... ncclient internal frames elided ...</span>
ncclient.transport.errors.<span class="hl">SSHError: Channel closed.</span></pre>
<p>Traceback lamba hai, par aakhri line jawab hai. (ncclient ke andar ke frames yahan hata diye gaye hain; lab mein aap unhe bhi dekhte ho, aur skip kar sakte ho.) <code>SSHError: Channel closed.</code> chapter 2 ka signature hai: SSH ne jawab diya, par us port par NETCONF subsystem nahi hai. <i>Hamara</i> code dikhane wala frame <code>ncutil.py</code> line 15 hai, jahan <code>connect()</code> <code>d["port"]</code> use karta hai. Inventory mein J1 port 22 par hai; 830 hona chahiye. Ek command se theek karte hain:</p>
<pre class="out">AUTO01$ sed -i 's/"port": 22,/"port": 830,/' ncutil.py

AUTO01$ python3 chg2041.py
J1: backup saved by session 1650 (1144 bytes)
R1: RPCError type=application tag=<span class="hl">invalid-value</span> severity=error
R1: <span class="hl">invalid value "172.16.10.500" for leaf ip (expected an IPv4 address)</span></pre>
<p>Agli run aage jaati hai: J1 ka backup chalta hai, aur R1 alag message se fail hota hai. Hum aage badhe.</p>

<h3>Fault 2: device data refuse karta hai</h3>
<p>R1 <code>tag=invalid-value</code> wala <code>RPCError</code> aur text <code>invalid value "172.16.10.500" for leaf ip (expected an IPv4 address)</code> report karta hai. IPv4 address ka koi hissa 500 nahi ho sakta. Yeh <code>IOSXE_CFG</code> mein typo hai (<code>.5</code> hona chahiye), isliye problem data hai, device, lock ya network nahi. Tag kehta hai retry mat karo. Theek karo aur dobara chalao:</p>
<pre class="out">AUTO01$ sed -i 's/172.16.10.500/172.16.10.5/' chg2041.py

AUTO01$ python3 chg2041.py
J1: backup saved by session <span class="hl">1667</span> (1144 bytes)
R1: running now reads ('TO-BLR-CORE', '172.16.10.5/30')
J1: change session is 1684
J1: RPCError type=protocol tag=<span class="hl">lock-denied</span> severity=error
J1: configuration database is locked by another session
J1: the lock is held by session <span class="hl">1667</span></pre>
<p>R1 ab chalta hai aur sahi read back deta hai. Script J1 tak pahunchti hai aur agle fault se milti hai.</p>

<h3>Fault 3: ek lock jo humne khud liya</h3>
<p>Error <code>lock-denied</code> hai, type <code>protocol</code>, aur helper line holder print karti hai: <b>session 1667</b>. Is number ko usi run ki pehli line se milao: <code>backup saved by session 1667</code>. Holder <b>hamara apna</b> backup hai. Function <code>backup()</code> <code>connect(name)</code> se session kholta hai (bina <code>with</code> ke), <code>m.lock("candidate")</code> bulata hai, aur use kabhi unlock ya close nahi karta. Jab <code>change_junos</code> baad mein session 1684 kholta hai aur lock karne ki koshish karta hai, to usi process ka ek session use refuse karta hai.</p>
<p>Data padhne (backup) ke liye lock ki zaroorat hi nahi. <code>lock</code> line hata dena sahi fix hai; lock sach mein chahiye ho to <code>with m.locked("candidate"):</code> use karte taaki woh chhoote.</p>
<pre class="out">AUTO01$ sed -i '/^    m\\.lock/d' chg2041.py

AUTO01$ python3 chg2041.py
J1: backup saved by session 1701 (1144 bytes)
R1: running now reads ('TO-BLR-CORE', '172.16.10.5/30')
J1: change session is 1718
J1: committed, running now reads ('TO-BLR-CORE', '172.16.20.5/30')
<span class="hl">CHG-2041 done: 2 of 2 devices changed</span></pre>

<h3>Fault 4: "done", par nahi hua</h3>
<p>Script kehti hai <code>CHG-2041 done: 2 of 2 devices changed</code> aur uske pehle ki har line sahi dikhti hai, commit ke baad ka read-back samet. Sab green tha. Ticket yahan band ho jaata. Par alag verification script thodi der baad chalti hai, kyunki Junos par clock matter karti hai:</p>
<pre class="out">AUTO01$ python3 wait.py 70
waiting 70 s ...
done
AUTO01$ python3 verify.py
J1 <span class="hl">WRONG</span> ('LINK-TO-PUN-OLD', '172.16.20.1/30')
R1 ok ('TO-BLR-CORE', '172.16.10.5/30')
J1&gt; show system commit
0   2026-10-11 08:09:12 UTC by root via other
    <span class="hl">automatic rollback (commit confirmed not confirmed)</span>
1   2026-10-11 08:08:12 UTC by netops via netconf commit confirmed, rollback in 1mins
2   2026-10-11 08:07:24 UTC by root via other</pre>
<p>J1 ke paas phir <b>purane</b> values hain. Commit log samjhata hai, aur yeh wahi line hai jo chapter 7 mein thi: entry 1 hamara "commit confirmed, rollback in 1mins" hai aur entry 0 "automatic rollback (commit confirmed not confirmed)". Kisi ne confirming commit nahi bheja. Change ek minute live raha (isliye script ka read-back sahi dikha) aur phir device ne chupchaap use design ke mutabiq wapas kar diya.</p>
<p>Fix: read-back sahi hone ke baad, usi session par confirming <code>m.commit()</code>:</p>
<pre class="code"><span class="c"># change_junos after the fix: confirm only after the read-back is right</span>
def change_junos(name):
    with connect(name) as m:
        print("%s: change session is %s" % (name, m.session_id))
        with m.locked("candidate"):
            m.edit_config(target="candidate", config=JUNOS_CFG)
            m.validate(source="candidate")
            m.commit(confirmed=True, timeout="60")
        have = read_interface(m, "junos", DEVICES[name]["uplink"])
        print("%s: committed, running now reads %s" % (name, have))
        m.commit()                                  <span class="c"># the confirming commit</span></pre>
<pre class="out">AUTO01$ python3 chg2041.py
J1: backup saved by session 1752 (1144 bytes)
R1: running now reads ('TO-BLR-CORE', '172.16.10.5/30')
J1: change session is 1769
J1: committed, running now reads ('TO-BLR-CORE', '172.16.20.5/30')
CHG-2041 done: 2 of 2 devices changed
AUTO01$ python3 wait.py 70
waiting 70 s ...
done
AUTO01$ python3 verify.py
J1 <span class="hl">ok</span> ('TO-BLR-CORE', '172.16.20.5/30')
R1 ok ('TO-BLR-CORE', '172.16.10.5/30')</pre>
<p>Ab verifier, jo 70 second baad chalta hai, dono devices sahi paata hai. (Asli script mein confirm se pehle chapter 9 ka new-session check bhi jodte. Lab fix ko chhota rakhta hai taaki wajah dikhti rahe.)</p>

<h3>Chaaron faults ek table mein</h3>
<table class="cmp"><tr><th>#</th><th>Symptom</th><th>Stage</th><th>Wajah</th><th>Fix</th></tr>
<tr><td>1</td><td><code>SSHError: Channel closed.</code></td><td>Transport</td><td>Inventory mein port 22</td><td>Port 830</td></tr>
<tr><td>2</td><td><code>invalid-value</code></td><td>Data</td><td>Typo <code>172.16.10.500</code></td><td>Value theek karo</td></tr>
<tr><td>3</td><td><code>lock-denied</code>, holder 1667</td><td>Locks</td><td>Apne backup ne lock pakda tha</td><td>Lock hatao (ya <code>with</code> use karo)</td></tr>
<tr><td>4</td><td>Ek minute baad change gayab</td><td>Commit, time</td><td>Confirmed commit confirm nahi hua</td><td>Read-back ke baad confirm karo</td></tr></table>

<div class="warn"><p><b>Common mistake.</b> Script ke apne "done" message par ticket band kar dena. Script woh nahi dekh sakti jo exit ke baad hota hai, aur confirmed commit timer se chalta hai. <i>Alag</i> run se verify karo, rollback time ke baad, aur commit log saboot ki tarah rakho.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Commit ke turant baad change dikha" saabit nahi karta ki woh permanent hai. Junos par <code>confirmed=True</code> ke saath woh timer khatam hone tak dikhta hai.</p></div>

<div class="scn"><h4>Friday ka green, Monday ka red</h4><p>Change window 22:00 par sab scripts green ke saath khatam hui. Monday ko monitoring ne 40 mein se 6 routers par purani description dikhayi. Chhahon Junos the; script ne 5 minute ke timer ke saath commit confirmed kiya tha aur confirm kiye bina exit kar gayi. Rollback 22:05 par hua, jab sab ghar ja chuke the. Post-change verifier pipeline mein jod diya gaya, har run ke 10 minute baad schedule karke.</p><p><b>Lesson:</b> jo sabse lamba timer aap use karte ho usse baad verify karo.</p></div>

<div class="iv"><p class="q">"NETCONF change script success report karti hai, par device mein change nahi hai. Kya check karoge?"</p><p>Pehle yeh ki kya confirmed commit tha jo confirm nahi hua: commit log mein "automatic rollback" dekhta hoon. Phir yeh ki kya kisi doosre session ya baad ke commit ne overwrite kiya, aur kya maine candidate mein likha par commit nahi kiya. Script ko read back karwata hoon aur rollback timer guzarne ke baad dobara verify karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Stages mein troubleshoot karo: transport, capabilities, data, locks, commit, time.</li>
<li>Traceback ki aakhri line aur <code>err.tag</code> stage batate hain; ncclient ke internal frames skip karo.</li>
<li><code>err.info</code> ka lock holder aapka apna pehle ka session ho sakta hai.</li>
<li>Unconfirmed confirmed commit gayab ho jaata hai; commit log "automatic rollback" dikhata hai.</li>
<li>Timer ke baad alag run se verify karo, sirf script ke andar nahi.</li>
</ul></div>
`}};export{e as default};