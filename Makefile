SRC_DIR = src
BUILD_DIR = build

PREFIX = .
DIST_DIR = ${PREFIX}/dist

BASE_FILES = ${SRC_DIR}/core.js\
	${SRC_DIR}/utils.js\
	${SRC_DIR}/parser.js\
	${SRC_DIR}/client.js\
	${SRC_DIR}/user.js\
	${SRC_DIR}/subject.js\
	${SRC_DIR}/collection.js\
	${SRC_DIR}/review.js\
	${SRC_DIR}/miniblog.js\
	${SRC_DIR}/recommendation.js\
	${SRC_DIR}/note.js\
	${SRC_DIR}/event.js\
	${SRC_DIR}/tag.js\
	${SRC_DIR}/jquery_handler.js\
	${SRC_DIR}/gears_handler.js\
	${SRC_DIR}/gadget_handler.js\
	${SRC_DIR}/gm_handler.js

MODULES = ${SRC_DIR}/intro.js\
	${BASE_FILES}\
	${SRC_DIR}/outro.js

JD = ${DIST_DIR}/jquery.douban.js
JD_MIN = ${DIST_DIR}/jquery.douban.min.js
JD_PACK = ${DIST_DIR}/jquery.douban.pack.js

JD_VER = `cat VERSION`
VER = sed s/@VERSION/${JD_VER}/

JAR = java -jar ${BUILD_DIR}/js.jar

all: douban min pack
	@@echo "jQuery Douban build complete."

${DIST_DIR}:
	@@mkdir -p ${DIST_DIR}

douban: ${DIST_DIR} ${JD}

${JD}: ${MODULES}
	@@echo "Building" ${JD}

	@@mkdir -p ${DIST_DIR}
	@@cat ${MODULES} | ${VER} > ${JD};

	@@echo ${JD} "Built"
	@@echo

pack: ${JD_PACK}

${JD_PACK}: ${JD}
	@@echo "Building" ${JD_PACK}

	@@echo " - Compressing using Packer"
	@@${JAR} ${BUILD_DIR}/build/pack.js ${JD} ${JD_PACK}

	@@echo ${JD_PACK} "Built"
	@@echo

min: ${JD_MIN}

${JD_MIN}: ${JD}
	@@echo "Building" ${JD_MIN}

	@@echo " - Compressing using Minifier"
	@@${JAR} ${BUILD_DIR}/build/min.js ${JD} ${JD_MIN}

	@@echo ${JD_MIN} "Built"
	@@echo
