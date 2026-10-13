var e={id:`two-vendors`,h:{en:`One function for two vendors: IOS XE and Junos`,hi:`Do vendors ke liye ek function: IOS XE aur Junos`},body:{en:`
<p>The real task is rarely "change R1". It is "make this change on every router we have", and the fleet has more than one vendor. This chapter brings together everything so far into <code>set_interface()</code>, one function that changes the description and IPv4 address of an interface on IOS XE and on Junos, checks the result, and is safe to run twice.</p>

<h3>An analogy: one order form, two kitchens</h3>
<p>A restaurant group has two kitchens that cook differently. The customer fills in one order form. A coordinator reads it, checks whether the dish is already on the table, hands it to the right kitchen, tastes the result, and only then sends it out. The form and the coordinator are the same everywhere; only the kitchens differ.</p>

<h3>How the two devices differ</h3>
<table class="cmp"><tr><th></th><th>R1 (IOS XE)</th><th>J1 (Junos)</th></tr>
<tr><td>Datastores</td><td>running only</td><td>candidate and running</td></tr>
<tr><td>When is an edit live?</td><td>At once (<code>:writable-running</code>)</td><td>After <code>commit</code></td></tr>
<tr><td>Safety net</td><td>None in NETCONF; save with <code>save_config()</code></td><td>Confirmed commit, rollback timer</td></tr>
<tr><td>Interface model</td><td>ietf-interfaces + ietf-ip (or Cisco native)</td><td>Junos configuration tree</td></tr>
<tr><td>Interface name</td><td><code>GigabitEthernet0/1</code></td><td><code>ge-0/0/1</code></td></tr>
<tr><td>IPv4 address</td><td><code>ip</code> and <code>netmask</code>, two leaves</td><td><code>address/name</code> as <code>a.b.c.d/len</code></td></tr>
<tr><td>Diff before apply</td><td>None; read first</td><td><code>compare_configuration()</code></td></tr>
<tr><td>Filters</td><td>subtree and xpath</td><td>subtree only</td></tr></table>

<h3>The design in four rules</h3>
<ol>
<li><b>Isolate what differs.</b> Only three small pieces know about the vendor: the reader (<code>read_interface</code>), the IOS XE writer and the Junos writer. Everything else is shared.</li>
<li><b>Read first, and do nothing if it is already right.</b> That makes the script <b>idempotent</b>: run it once or ten times and the end state is the same, with no pointless commits and no log noise.</li>
<li><b>Read back after writing.</b> A call that did not raise means the device accepted the message, not that the state is what you wanted. Compare what the device now holds with what you asked for.</li>
<li><b>Keep the safety net on, and confirm last.</b> On Junos the change is committed confirmed, and the confirming commit is only sent after a new session proves access.</li></ol>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Flow of set_interface">
<rect x="200" y="6" width="240" height="34" rx="8" fill="#bae6fd"/><text x="320" y="28" text-anchor="middle" class="svg-ink" font-size="13">set_interface(name, description, address)</text>
<rect x="200" y="56" width="240" height="34" rx="8" fill="#ddd6fe"/><text x="320" y="78" text-anchor="middle" class="svg-ink" font-size="13">read_interface: is it already right?</text>
<rect x="500" y="56" width="132" height="34" rx="8" fill="#e2e8f0"/><text x="566" y="78" text-anchor="middle" class="svg-ink" font-size="12">yes: nothing to do</text>
<rect x="30" y="112" width="190" height="52" rx="8" fill="#fed7aa"/><text x="125" y="134" text-anchor="middle" class="svg-ink" font-size="13">IOS XE: push_iosxe</text><text x="125" y="152" text-anchor="middle" class="svg-muted" font-size="11">edit running, live at once</text>
<rect x="420" y="112" width="190" height="52" rx="8" fill="#bbf7d0"/><text x="515" y="134" text-anchor="middle" class="svg-ink" font-size="13">Junos: push_junos</text><text x="515" y="152" text-anchor="middle" class="svg-muted" font-size="11">candidate, diff, commit confirmed</text>
<rect x="200" y="182" width="240" height="30" rx="8" fill="#fde68a"/><text x="320" y="202" text-anchor="middle" class="svg-ink" font-size="13">read back: does it match?</text>
<rect x="200" y="220" width="240" height="26" rx="8" fill="#bbf7d0"/><text x="320" y="238" text-anchor="middle" class="svg-ink" font-size="12">Junos only: new session works? then commit()</text>
<line x1="320" y1="40" x2="320" y2="56" stroke="#64748b" stroke-width="2"/><line x1="440" y1="73" x2="500" y2="73" stroke="#64748b" stroke-width="2"/>
<line x1="270" y1="90" x2="125" y2="112" stroke="#64748b" stroke-width="2"/><line x1="370" y1="90" x2="515" y2="112" stroke="#64748b" stroke-width="2"/>
<line x1="125" y1="164" x2="270" y2="182" stroke="#64748b" stroke-width="2"/><line x1="515" y1="164" x2="370" y2="182" stroke="#64748b" stroke-width="2"/>
<line x1="320" y1="212" x2="320" y2="220" stroke="#64748b" stroke-width="2"/>
</svg></div>
<p class="cap">The flow of <code>set_interface()</code>. The orange and green boxes are the only vendor-specific code.</p>

<h3>The whole function</h3>
<p>Here is the second half of <code>ifchange.py</code>, the part you finish in Lab 1, step 5. Parts 1 to 3 (the reader and the two writers) came in chapters 4, 5 and 6.</p>
<pre class="code"><span class="c"># ifchange.py, part 4 (Lab 1, step 5) - the function that ties it together</span>
def still_reachable(name):
    """Open a brand-new session: proves the management path still works after the change."""
    try:
        with connect(name, timeout=5):
            return True
    except Exception as err:
        print("%s: new session failed (%s)" % (name, type(err).__name__))
        return False


def set_interface(name, description, address, ifname=None):
    dev = DEVICES[name]
    ifname = ifname or dev["uplink"]
    with connect(name) as m:
        if read_interface(m, dev["vendor"], ifname) == (description, address):
            print("%s %s: already as requested, nothing to do" % (name, ifname))
            return True
        if dev["vendor"] == "iosxe":
            push_iosxe(m, ifname, description, address)
        else:
            push_junos(m, ifname, description, address)
        after = read_interface(m, dev["vendor"], ifname)
        if after != (description, address):
            print("%s %s: VERIFY FAILED, device has %s" % (name, ifname, after))
            return False
        if dev["vendor"] == "junos":
            if not still_reachable(name):
                print("%s: NOT confirming - Junos rolls the change back in 60 s" % name)
                return False
            m.commit()
    print("%s %s: changed and verified: %s %s" % (name, ifname, after[0], after[1]))
    return True


if __name__ == "__main__":
    name, description, address = sys.argv[1:4]
    ifname = sys.argv[4] if len(sys.argv) &gt; 4 else None
    try:
        ok = set_interface(name, description, address, ifname)
    except RPCError as err:
        print("%s: the device rejected the change: %s (%s)" % (name, err.message, err.tag))
        ok = False
    sys.exit(0 if ok else 1)</pre>
<p>Walk through it in order.</p>
<ul>
<li><b>Open one session.</b> <code>with connect(name)</code> closes it for you on any exit.</li>
<li><b>Read.</b> If the tuple <code>(description, address)</code> already equals the request, print "already as requested", and return success. No edit is sent.</li>
<li><b>Write.</b> The vendor string decides which writer runs. On Junos, <code>push_junos</code> locks, diffs, validates and commits confirmed.</li>
<li><b>Read back.</b> If the device does not hold the requested values afterwards, print <code>VERIFY FAILED</code>, return failure and, on Junos, <b>do not confirm</b>.</li>
<li><b>Prove access.</b> <code>still_reachable()</code> opens a second, brand-new session with a 5-second timeout. If that fails the function refuses to confirm.</li>
<li><b>Confirm.</b> <code>m.commit()</code> turns the temporary commit into a permanent one.</li>
<li><b>Exit code.</b> The <code>__main__</code> block catches an <code>RPCError</code>, prints the device's reason and tag, and exits 1; success is 0. A scheduler or pipeline can tell what happened from that number alone.</li></ul>

<h3>Running it on both vendors</h3>
<p>CHG-2042 asks for the uplink to be renamed <code>TO-HYD-CORE</code> with new /30 addresses. The same command pattern works for both devices:</p>
<pre class="out">AUTO01$ python3 ifchange.py R1 TO-HYD-CORE 172.16.10.9/30
R1 GigabitEthernet0/1: <span class="hl">changed and verified: TO-HYD-CORE 172.16.10.9/30</span>
AUTO01$ python3 ifchange.py J1 TO-HYD-CORE 172.16.20.9/30
[edit interfaces ge-0/0/1]
-   description TO-BLR-CORE;
+   description TO-HYD-CORE;
[edit interfaces ge-0/0/1 unit 0 family inet]
-   address 172.16.20.5/30;
+   address 172.16.20.9/30;
J1 ge-0/0/1: <span class="hl">changed and verified: TO-HYD-CORE 172.16.20.9/30</span></pre>
<p>R1 printed one line: its edit was live at once, then verified. J1 printed the diff first, because <code>push_junos</code> shows it, and then the same final line. Both end with the same sentence, because the function hides the difference.</p>

<h3>Running it again</h3>
<p>Run the same two commands again, and look at the exit code with <code>echo $?</code>:</p>
<pre class="out">AUTO01$ python3 ifchange.py R1 TO-HYD-CORE 172.16.10.9/30; echo "exit code: $?"
R1 GigabitEthernet0/1: <span class="hl">already as requested, nothing to do</span>
exit code: <span class="hl">0</span>
AUTO01$ python3 ifchange.py J1 TO-HYD-CORE 172.16.20.9/30; echo "exit code: $?"
J1 ge-0/0/1: <span class="hl">already as requested, nothing to do</span>
exit code: <span class="hl">0</span></pre>
<p>Nothing is sent, and on Junos no commit appears in the log. The exit code is 0, because "already as requested" is a success, not an error. This is the property that lets you re-run a failed batch without thinking.</p>

<div class="warn"><p><b>Common mistake.</b> Treating "the call did not raise" as "the change is correct". An <code>edit_config</code> with <code>merge</code> can succeed and still leave the device in a different state than you wanted, for example an old IP address that stays because the new one was merged as a second address. Reading back is the only proof.</p></div>
<div class="exam"><p><b>Exam trap.</b> <b>Idempotent</b> does not mean "does not change anything"; it means that doing it again changes nothing more. Designing for it means reading the current state and comparing before you write.</p></div>

<div class="scn"><h4>Three vendors, one backlog</h4><p>A team had three change scripts: one for IOS XE, one for Junos and one for a third platform. Each handled errors differently, and each was updated at different times. After merging them into one entry point with a reader and a writer per vendor, adding the fourth platform meant writing two small functions, and every platform inherited the verify step and the exit-code rule.</p><p><b>Lesson:</b> share the policy (read, write, verify, confirm); isolate the dialect.</p></div>

<div class="iv"><p class="q">"How would you write one script that works on both IOS XE and Junos?"</p><p>I read capabilities or the device vendor first, then keep the vendor-specific parts in small functions: a reader, and a writer for each platform. The shared wrapper reads the state, exits if it is already right, writes, reads back to verify, and on Junos only confirms after a new session proves access. That makes it idempotent and safe for batches.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Isolate vendor differences in a reader and one writer per platform; share the rest.</li>
<li>Read first: if the device already matches, do nothing and return success.</li>
<li>Read back after the write; compare what the device holds with what you asked for.</li>
<li>On Junos commit confirmed, test with a new session, then <code>commit()</code>.</li>
<li>Return an exit code (0 or 1) so schedulers know the result.</li>
</ul></div>
`,hi:`
<p>Asli kaam shayad hi kabhi "R1 badlo" hota hai. Woh hota hai "yeh change hamare har router par karo", aur fleet mein ek se zyada vendor hote hain. Yeh chapter ab tak ka sab kuch <code>set_interface()</code> mein jodta hai, ek function jo IOS XE aur Junos par interface ki description aur IPv4 address badalta hai, result check karta hai, aur do baar chalane par safe hai.</p>

<h3>Analogy: ek order form, do kitchens</h3>
<p>Restaurant group ke paas do kitchens hain jo alag tarah se pakate hain. Customer ek order form bharta hai. Coordinator use padhta hai, dekhta hai ki dish kahin mez par pehle se to nahi, use sahi kitchen ko deta hai, result chakhta hai, aur tab hi bahar bhejta hai. Form aur coordinator har jagah wahi hain; sirf kitchens alag hain.</p>

<h3>Dono devices mein farq</h3>
<table class="cmp"><tr><th></th><th>R1 (IOS XE)</th><th>J1 (Junos)</th></tr>
<tr><td>Datastores</td><td>sirf running</td><td>candidate aur running</td></tr>
<tr><td>Edit kab live hota hai?</td><td>Turant (<code>:writable-running</code>)</td><td><code>commit</code> ke baad</td></tr>
<tr><td>Safety net</td><td>NETCONF mein nahi; <code>save_config()</code> se save karo</td><td>Confirmed commit, rollback timer</td></tr>
<tr><td>Interface model</td><td>ietf-interfaces + ietf-ip (ya Cisco native)</td><td>Junos configuration tree</td></tr>
<tr><td>Interface naam</td><td><code>GigabitEthernet0/1</code></td><td><code>ge-0/0/1</code></td></tr>
<tr><td>IPv4 address</td><td><code>ip</code> aur <code>netmask</code>, do leaves</td><td><code>address/name</code>, <code>a.b.c.d/len</code> ki tarah</td></tr>
<tr><td>Apply se pehle diff</td><td>Nahi; pehle padho</td><td><code>compare_configuration()</code></td></tr>
<tr><td>Filters</td><td>subtree aur xpath</td><td>sirf subtree</td></tr></table>

<h3>Design: chaar niyam</h3>
<ol>
<li><b>Jo alag hai use alag rakho.</b> Sirf teen chhote hisse vendor jaante hain: reader (<code>read_interface</code>), IOS XE writer aur Junos writer. Baaki sab shared hai.</li>
<li><b>Pehle padho, aur sahi ho to kuch mat karo.</b> Isse script <b>idempotent</b> banti hai: ek baar chalao ya das baar, end state wahi, bekaar commits nahi aur log mein shor nahi.</li>
<li><b>Likhne ke baad read back karo.</b> Jis call ne raise nahi kiya uska matlab hai device ne message accept kiya, yeh nahi ki state wahi hai jo aap chahte the. Device ab jo rakhta hai use apni maang se milao.</li>
<li><b>Safety net on rakho, aur confirm sabse aakhir mein.</b> Junos par change commit confirmed hota hai, aur confirming commit tabhi jaata hai jab naya session access saabit kar de.</li></ol>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Flow of set_interface">
<rect x="200" y="6" width="240" height="34" rx="8" fill="#bae6fd"/><text x="320" y="28" text-anchor="middle" class="svg-ink" font-size="13">set_interface(name, description, address)</text>
<rect x="200" y="56" width="240" height="34" rx="8" fill="#ddd6fe"/><text x="320" y="78" text-anchor="middle" class="svg-ink" font-size="13">read_interface: is it already right?</text>
<rect x="500" y="56" width="132" height="34" rx="8" fill="#e2e8f0"/><text x="566" y="78" text-anchor="middle" class="svg-ink" font-size="12">yes: nothing to do</text>
<rect x="30" y="112" width="190" height="52" rx="8" fill="#fed7aa"/><text x="125" y="134" text-anchor="middle" class="svg-ink" font-size="13">IOS XE: push_iosxe</text><text x="125" y="152" text-anchor="middle" class="svg-muted" font-size="11">edit running, live at once</text>
<rect x="420" y="112" width="190" height="52" rx="8" fill="#bbf7d0"/><text x="515" y="134" text-anchor="middle" class="svg-ink" font-size="13">Junos: push_junos</text><text x="515" y="152" text-anchor="middle" class="svg-muted" font-size="11">candidate, diff, commit confirmed</text>
<rect x="200" y="182" width="240" height="30" rx="8" fill="#fde68a"/><text x="320" y="202" text-anchor="middle" class="svg-ink" font-size="13">read back: does it match?</text>
<rect x="200" y="220" width="240" height="26" rx="8" fill="#bbf7d0"/><text x="320" y="238" text-anchor="middle" class="svg-ink" font-size="12">Junos only: new session works? then commit()</text>
<line x1="320" y1="40" x2="320" y2="56" stroke="#64748b" stroke-width="2"/><line x1="440" y1="73" x2="500" y2="73" stroke="#64748b" stroke-width="2"/>
<line x1="270" y1="90" x2="125" y2="112" stroke="#64748b" stroke-width="2"/><line x1="370" y1="90" x2="515" y2="112" stroke="#64748b" stroke-width="2"/>
<line x1="125" y1="164" x2="270" y2="182" stroke="#64748b" stroke-width="2"/><line x1="515" y1="164" x2="370" y2="182" stroke="#64748b" stroke-width="2"/>
<line x1="320" y1="212" x2="320" y2="220" stroke="#64748b" stroke-width="2"/>
</svg></div>
<p class="cap"><code>set_interface()</code> ka flow. Orange aur green boxes hi akele vendor-specific code hain.</p>

<h3>Poora function</h3>
<p>Yeh <code>ifchange.py</code> ka doosra aadha hai, jo aap Lab 1 ke step 5 mein poora karte ho. Parts 1 se 3 (reader aur do writers) chapters 4, 5 aur 6 mein aaye.</p>
<pre class="code"><span class="c"># ifchange.py, part 4 (Lab 1, step 5) - the function that ties it together</span>
def still_reachable(name):
    """Open a brand-new session: proves the management path still works after the change."""
    try:
        with connect(name, timeout=5):
            return True
    except Exception as err:
        print("%s: new session failed (%s)" % (name, type(err).__name__))
        return False


def set_interface(name, description, address, ifname=None):
    dev = DEVICES[name]
    ifname = ifname or dev["uplink"]
    with connect(name) as m:
        if read_interface(m, dev["vendor"], ifname) == (description, address):
            print("%s %s: already as requested, nothing to do" % (name, ifname))
            return True
        if dev["vendor"] == "iosxe":
            push_iosxe(m, ifname, description, address)
        else:
            push_junos(m, ifname, description, address)
        after = read_interface(m, dev["vendor"], ifname)
        if after != (description, address):
            print("%s %s: VERIFY FAILED, device has %s" % (name, ifname, after))
            return False
        if dev["vendor"] == "junos":
            if not still_reachable(name):
                print("%s: NOT confirming - Junos rolls the change back in 60 s" % name)
                return False
            m.commit()
    print("%s %s: changed and verified: %s %s" % (name, ifname, after[0], after[1]))
    return True


if __name__ == "__main__":
    name, description, address = sys.argv[1:4]
    ifname = sys.argv[4] if len(sys.argv) &gt; 4 else None
    try:
        ok = set_interface(name, description, address, ifname)
    except RPCError as err:
        print("%s: the device rejected the change: %s (%s)" % (name, err.message, err.tag))
        ok = False
    sys.exit(0 if ok else 1)</pre>
<p>Ise order mein samjho.</p>
<ul>
<li><b>Ek session kholo.</b> <code>with connect(name)</code> kisi bhi exit par use band kar deta hai.</li>
<li><b>Padho.</b> Tuple <code>(description, address)</code> maang ke barabar ho to "already as requested" print karo aur success lautao. Koi edit nahi bheja jaata.</li>
<li><b>Likho.</b> Vendor string tay karti hai kaunsa writer chale. Junos par <code>push_junos</code> lock karta hai, diff dikhata hai, validate karta hai aur commit confirmed karta hai.</li>
<li><b>Read back.</b> Baad mein device maange gaye values na rakhe to <code>VERIFY FAILED</code> print karo, failure lautao aur Junos par <b>confirm mat karo</b>.</li>
<li><b>Access saabit karo.</b> <code>still_reachable()</code> 5-second timeout ke saath ek doosra, bilkul naya session kholta hai. Woh fail ho to function confirm karne se mana karta hai.</li>
<li><b>Confirm.</b> <code>m.commit()</code> temporary commit ko permanent bana deta hai.</li>
<li><b>Exit code.</b> <code>__main__</code> block <code>RPCError</code> pakadta hai, device ka reason aur tag print karta hai, aur 1 se exit karta hai; success 0 hai. Scheduler ya pipeline sirf us number se samajh sakta hai kya hua.</li></ul>

<h3>Dono vendors par chalana</h3>
<p>CHG-2042 uplink ko naye /30 addresses ke saath <code>TO-HYD-CORE</code> naam dene ko kehta hai. Wahi command pattern dono devices par chalta hai:</p>
<pre class="out">AUTO01$ python3 ifchange.py R1 TO-HYD-CORE 172.16.10.9/30
R1 GigabitEthernet0/1: <span class="hl">changed and verified: TO-HYD-CORE 172.16.10.9/30</span>
AUTO01$ python3 ifchange.py J1 TO-HYD-CORE 172.16.20.9/30
[edit interfaces ge-0/0/1]
-   description TO-BLR-CORE;
+   description TO-HYD-CORE;
[edit interfaces ge-0/0/1 unit 0 family inet]
-   address 172.16.20.5/30;
+   address 172.16.20.9/30;
J1 ge-0/0/1: <span class="hl">changed and verified: TO-HYD-CORE 172.16.20.9/30</span></pre>
<p>R1 ne ek line print ki: uska edit turant live hua, phir verify hua. J1 ne pehle diff print kiya, kyunki <code>push_junos</code> use dikhata hai, aur phir wahi aakhri line. Dono ek hi vaakya par khatam hote hain, kyunki function farq chhupa leta hai.</p>

<h3>Dobara chalana</h3>
<p>Wahi do commands dobara chalao, aur exit code <code>echo $?</code> se dekho:</p>
<pre class="out">AUTO01$ python3 ifchange.py R1 TO-HYD-CORE 172.16.10.9/30; echo "exit code: $?"
R1 GigabitEthernet0/1: <span class="hl">already as requested, nothing to do</span>
exit code: <span class="hl">0</span>
AUTO01$ python3 ifchange.py J1 TO-HYD-CORE 172.16.20.9/30; echo "exit code: $?"
J1 ge-0/0/1: <span class="hl">already as requested, nothing to do</span>
exit code: <span class="hl">0</span></pre>
<p>Kuch nahi bheja gaya, aur Junos par log mein koi commit nahi aaya. Exit code 0 hai, kyunki "already as requested" success hai, error nahi. Isi gun se aap fail hue batch ko bina soche dobara chala sakte ho.</p>

<div class="warn"><p><b>Common mistake.</b> "Call ne raise nahi kiya" ko "change sahi hai" samajhna. <code>merge</code> wala <code>edit_config</code> succeed ho sakta hai aur phir bhi device ko aisi state mein chhod sakta hai jo aap nahi chahte the, jaise purana IP address jo isliye bacha kyunki naya address doosre address ki tarah merge hua. Read-back hi ek saboot hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> <b>Idempotent</b> ka matlab "kuch nahi badalta" nahi; matlab hai ki dobara karne par aur kuch nahi badalta. Iske liye design ka matlab hai likhne se pehle maujooda state padhna aur milana.</p></div>

<div class="scn"><h4>Teen vendors, ek backlog</h4><p>Ek team ke paas teen change scripts thi: IOS XE ke liye, Junos ke liye, aur teesre platform ke liye. Har ek errors alag handle karti thi, aur alag samay par update hoti thi. Unhe ek entry point mein, har vendor ke liye reader aur writer ke saath, milane ke baad chautha platform jodna matlab do chhote functions likhna tha, aur har platform ko verify step aur exit-code rule mil gaya.</p><p><b>Lesson:</b> policy share karo (read, write, verify, confirm); dialect alag rakho.</p></div>

<div class="iv"><p class="q">"IOS XE aur Junos dono par chalne wali ek script kaise likhoge?"</p><p>Pehle capabilities ya device vendor padhta hoon, phir vendor-specific hisse chhote functions mein rakhta hoon: ek reader, aur har platform ka ek writer. Shared wrapper state padhta hai, sahi ho to nikal jaata hai, likhta hai, verify ke liye read back karta hai, aur Junos par naya session access saabit kare tabhi confirm karta hai. Isse woh idempotent aur batches ke liye safe hoti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Vendor ke farq ko reader aur har platform ke ek writer mein rakho; baaki share karo.</li>
<li>Pehle padho: device pehle se match kare to kuch mat karo aur success lautao.</li>
<li>Write ke baad read back karo; device ne jo rakha use apni maang se milao.</li>
<li>Junos par commit confirmed, naye session se test, phir <code>commit()</code>.</li>
<li>Exit code (0 ya 1) lautao taaki schedulers ko result pata chale.</li>
</ul></div>
`}};export{e as default};